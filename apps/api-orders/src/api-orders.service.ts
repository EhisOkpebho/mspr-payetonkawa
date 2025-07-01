import { Customer } from '@app/shared/entities/customer.entity'
import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { ProductDTO } from '@app/shared/types/dto/product.dto'
import { HttpService } from '@nestjs/axios'
import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import * as fs from 'fs'
import * as path from 'path'
import * as PDFDocument from 'pdfkit'
import { lastValueFrom } from 'rxjs'
import { Repository } from 'typeorm'

@Injectable()
export class ApiOrdersService {
	private readonly logger = new Logger(ApiOrdersService.name)

	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>,
		@Inject('PRODUCTS_SERVICE')
		private readonly productsClient: ClientProxy,
		private readonly httpService: HttpService,
	) {}

	async create(dto: CreateOrderDto, customer: Customer): Promise<Buffer> {
		if (!customer) {
			throw new ForbiddenException('User does not have a customer profile')
		}

		const trustKey = this.configService.get<string>('MS_API_ORDERS_TRUST_KEY')
		const servicePort = this.configService.get<string>('MS_API_PRODUCTS_PORT') || '3002'

		let product: ProductDTO

		try {
			const response = await lastValueFrom(
				this.httpService.get<ProductDTO>(`http://localhost:${servicePort}/products/${dto.productId}`, {
					headers: {
						MS_TRUST_ID: 'api_orders',
						MS_TRUST_KEY: trustKey,
					},
				}),
			)
			product = response.data
		} catch (error) {
			if (error.response?.status === 404) throw new NotFoundException(`Product ${dto.productId} not found`)

			if (error.response) throw new BadRequestException(`Product service error: ${error.response.status}`)

			if (error.request) throw new BadRequestException(`Product service unreachable`)

			throw new BadRequestException(`Unexpected error contacting product service`)
		}

		if (!product) throw new NotFoundException(`Product ${dto.productId} not found`)

		if (product.stock < dto.quantity)
			throw new BadRequestException(`Insufficient stock for product ${dto.productId} (remaining: ${product.stock})`)

		const order = await this.orderRepository.save({ ...dto, customerId: customer.id })

		lastValueFrom(this.productsClient.emit('order.created', { order }))

		const pdfBuffer = await this.generateOrderPDF(order, product, customer)

		const filePath = await this.savePDFToFileSystem(order.id, pdfBuffer)
		this.logger.log(`PDF saved for order ${order.id} at location: ${filePath}`)

		return pdfBuffer
	}

	async findByCustomerId(customerId: number): Promise<Order[]> {
		if (!customerId) {
			throw new BadRequestException('Customer ID is required')
		}

		return await this.orderRepository.find({ where: { customerId } })
	}

	async findAll(): Promise<Order[]> {
		return this.orderRepository.find()
	}

	async findById(id: number): Promise<Order> {
		const order = await this.orderRepository.findOne({ where: { id } })
		if (!order) {
			throw new NotFoundException(`Order with id ${id} not found`)
		}
		return order
	}

	async generateOrderPDF(order: Order, product: ProductDTO, customer: Customer): Promise<Buffer> {
		this.logger.log(`Starting PDF generation for order ${order.id}`)

		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({ margin: 50 })
			const buffers: Buffer[] = []

			doc.on('data', (chunk) => buffers.push(chunk))
			doc.on('end', () => {
				this.logger.log(`PDF generation completed for order ${order.id}`)
				resolve(Buffer.concat(buffers))
			})
			doc.on('error', (error) => {
				this.logger.error(`PDF generation failed for order ${order.id}: ${error.message}`)
				reject(error)
			})

			doc.fillColor('#8B4513').fontSize(24).font('Helvetica-Bold').text('FACTURE DE COMMANDE', { align: 'center' })

			doc.moveTo(50, doc.y + 10)
				.lineTo(545, doc.y + 10)
				.strokeColor('#8B4513')
				.lineWidth(2)
				.stroke()

			doc.moveDown(3)

			doc.fillColor('#1f2937').fontSize(16).font('Helvetica-Bold').text('INFORMATIONS CLIENT')

			doc.fontSize(12)
				.moveDown(0.5)
				.font('Helvetica')
				.text(`Nom: `, { continued: true })
				.font('Helvetica-Bold')
				.text(`${customer.firstName} ${customer.lastName}`)

			doc.font('Helvetica').text(`Nom d'utilisateur: `, { continued: true }).font('Helvetica-Bold').text(`${customer.username}`)

			if (customer.companyName) {
				doc.font('Helvetica').text(`Entreprise: `, { continued: true }).font('Helvetica-Bold').text(`${customer.companyName}`)
			}

			doc.font('Helvetica')
				.text(`Adresse: `, { continued: true })
				.font('Helvetica-Bold')
				.text(`${customer.city} ${customer.postalCode}`)

			doc.moveDown(2.5)

			doc.fillColor('#1f2937').fontSize(16).font('Helvetica-Bold').text('DÉTAILS DE LA COMMANDE')

			doc.fontSize(12)
				.moveDown(0.5)
				.font('Helvetica')
				.text(`Numéro de commande: `, { continued: true })
				.font('Helvetica-Bold')
				.text(`#${order.id}`)

			doc.font('Helvetica')
				.text(`Date: `, { continued: true })
				.font('Helvetica-Bold')
				.text(`${new Date().toLocaleDateString('fr-FR')}`)

			doc.font('Helvetica').text(`ID Client: `, { continued: true }).font('Helvetica-Bold').text(`${order.customerId}`)

			doc.moveDown(2.5)

			doc.fillColor('#1f2937').fontSize(16).font('Helvetica-Bold').text('DÉTAILS DU PRODUIT')

			doc.moveDown(1)

			const tableTop = doc.y
			const tableLeft = 50
			const tableWidth = 495

			doc.rect(tableLeft, tableTop, tableWidth, 25).fillColor('#f3f4f6').fill()

			doc.fillColor('#1f2937')
				.fontSize(12)
				.font('Helvetica-Bold')
				.text('Produit', tableLeft + 10, tableTop + 8)
				.text('Prix unitaire', tableLeft + 250, tableTop + 8)
				.text('Quantité', tableLeft + 350, tableTop + 8)
				.text('Total', tableLeft + 430, tableTop + 8)

			const rowY = tableTop + 25
			doc.rect(tableLeft, rowY, tableWidth, 30).strokeColor('#e5e7eb').stroke()

			doc.fillColor('#1f2937')
				.fontSize(11)
				.font('Helvetica')
				.text(product.name, tableLeft + 10, rowY + 10, { width: 230 })
				.text(`${product.details.price}€`, tableLeft + 250, rowY + 10)
				.text(`${order.quantity}`, tableLeft + 350, rowY + 10)
				.font('Helvetica-Bold')
				.text(`${(product.details.price * order.quantity).toFixed(2)}€`, tableLeft + 430, rowY + 10)

			doc.moveDown(4)

			doc.fillColor('#059669')
				.fontSize(18)
				.font('Helvetica-Bold')
				.text(`TOTAL: ${(product.details.price * order.quantity).toFixed(2)}€`, {
					align: 'right',
				})

			doc.end()
		})
	}

	private async savePDFToFileSystem(orderId: number, pdfBuffer: Buffer): Promise<string> {
		const uploadDir = path.join(process.cwd(), 'uploads', 'order-pdfs')

		if (!fs.existsSync(uploadDir)) {
			await fs.promises.mkdir(uploadDir, { recursive: true })
		}

		const fileName = `commande_${orderId}_${new Date().getTime()}.pdf`
		const filePath = path.join(uploadDir, fileName)

		await fs.promises.writeFile(filePath, pdfBuffer)

		return filePath
	}
}
