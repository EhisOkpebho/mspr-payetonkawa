import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { ProductDTO } from '@app/shared/types/dto/product.dto'
import { HttpService } from '@nestjs/axios'
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { lastValueFrom } from 'rxjs'
import { Repository } from 'typeorm'

@Injectable()
export class ApiOrdersService {
	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>,
		@Inject('PRODUCTS_SERVICE')
		private readonly productsClient: ClientProxy,
		private readonly httpService: HttpService,
	) {}

	async create(dto: CreateOrderDto): Promise<Order> {
		if (!dto.customerId) {
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

		const order = await this.orderRepository.save(dto)

		lastValueFrom(this.productsClient.emit('order.created', { order }))

		return order
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
}
