import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { AuthGuard } from '@app/shared/_guards/auth.guard'
import { Order } from '@app/shared/entities/order.entity'
import { User } from '@app/shared/entities/user.entity'
import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { ApiProductsService } from './api-products.service'
import { InjectMetric } from '@app/shared/metrics/decorators/inject-metric.decorator'
import { Histogram } from 'prom-client'

@UseGuards(AuthGuard)
@Controller('products')
export class ApiProductsController {
	private readonly logger = new Logger(ApiProductsController.name)

	constructor(
		private readonly productsService: ApiProductsService,
		@InjectMetric('HTTP_REQUEST_DURATION_SECONDS')
		private readonly requestDuration: Histogram<'method' | 'route' | 'status'>,
	) {}

	@EventPattern('order.created')
	async handleOrderCreated(@Payload() data: { order: Order }) {
		this.logger.log(`EVENT order.created received with order ID: ${data.order.id}`)
		const product = await this.productsService.findById(data.order.productId)
		if (!product) {
			this.logger.error(`Product with ID ${data.order.productId} not found for order ID: ${data.order.id}`)
			return
		}
		const res = await this.productsService.update(data.order.productId, {
			stock: product.stock - data.order.quantity,
		})
		this.logger.log(`Stock updated for order ID: ${data.order.id}, (Stock: ${product.stock} -> ${res.stock})`)
	}

	@Roles('admin', 'manager')
	@Post()
	async create(@Body() product: CreateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		const end = this.requestDuration.startTimer({ method: 'POST', route: '/products' })
		this.logger.log(`POST /products by user ${user.id}`)
		try {
			const result = await this.productsService.create(product)
			end({ status: '201' })
			return result
		} catch (e) {
			end({ status: '500' })
			throw e
		}
	}

	@Roles('admin', 'manager')
	@Put('/:id')
	async update(@Param('id', ParseIntPipe) id: number, @Body() product: UpdateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		const end = this.requestDuration.startTimer({ method: 'PUT', route: '/products/:id' })
		this.logger.log(`PUT /products/${id} by user ${user.id}`)
		try {
			const result = await this.productsService.update(id, product)
			end({ status: '200' })
			return result
		} catch (e) {
			end({ status: '500' })
			throw e
		}
	}

	@Roles('admin', 'manager')
	@Delete('/:id')
	async delete(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<boolean> {
		const end = this.requestDuration.startTimer({ method: 'DELETE', route: '/products/:id' })
		this.logger.log(`DELETE /products/${id} by user ${user.id}`)
		try {
			const result = await this.productsService.delete(id)
			end({ status: '200' })
			return result
		} catch (e) {
			end({ status: '500' })
			throw e
		}
	}

	@Roles('admin', 'manager')
	@Get()
	async findAll(@ReqUser() user: User): Promise<ProductDTO[]> {
		const end = this.requestDuration.startTimer({ method: 'GET', route: '/products' })
		this.logger.log(`GET /products by user ${user.id}`)
		try {
			const result = await this.productsService.findAll()
			end({ status: '200' })
			return result
		} catch (e) {
			end({ status: '500' })
			throw e
		}
	}

	@Roles('api_orders', 'admin', 'manager', 'customer')
	@Get('/:id')
	async findById(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<ProductDTO> {
		const end = this.requestDuration.startTimer({ method: 'GET', route: '/products/:id' })
		this.logger.log(`GET /products/${id} by user ${user?.id ?? 'microservice'}`)
		try {
			const result = await this.productsService.findById(id)
			end({ status: '200' })
			return result
		} catch (e) {
			end({ status: '404' })
			throw e
		}
	}
}
