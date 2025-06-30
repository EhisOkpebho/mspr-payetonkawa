import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { AuthGuard } from '@app/shared/_guards/auth.guard'
import { Order } from '@app/shared/entities/order.entity'
import { User } from '@app/shared/entities/user.entity'
import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { ApiProductsService } from './api-products.service'
import * as client from 'prom-client'

@UseGuards(AuthGuard)
@Controller('products')
export class ApiProductsController {
	private readonly logger = new Logger(ApiProductsController.name)

	constructor(private readonly productsService: ApiProductsService) {}

	private readonly requestDuration = new client.Histogram({
		name: 'http_request_duration_seconds_products',
		help: 'Duration of /products HTTP requests in seconds',
		labelNames: ['method', 'route', 'status'] as const,
		buckets: [0.1, 0.5, 1, 2, 5],
	})

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

	@Roles('admin', 'manager', 'distributor')
	@Post()
	async create(@Body() product: CreateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		const end = this.requestDuration.startTimer({ method: 'POST', route: '/products', status: '201' })
		this.logger.log(`POST /products by user ${user.id}`)
		const result = await this.productsService.create(product)
		end()
		return result
	}

	@Roles('admin', 'manager', 'distributor')
	@Put('/:id')
	async update(@Param('id', ParseIntPipe) id: number, @Body() product: UpdateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		const end = this.requestDuration.startTimer({ method: 'PUT', route: '/products/:id', status: '200' })
		this.logger.log(`PUT /products/${id} by user ${user.id}`)
		const result = await this.productsService.update(id, product)
		end()
		return result
	}

	@Roles('admin', 'manager', 'distributor')
	@Delete('/:id')
	async delete(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<boolean> {
		const end = this.requestDuration.startTimer({ method: 'DELETE', route: '/products/:id', status: '200' })
		this.logger.log(`DELETE /products/${id} by user ${user.id}`)
		const result = await this.productsService.delete(id)
		end()
		return result
	}

	@Roles('admin', 'manager', 'customer')
	@Get()
	async findAll(@ReqUser() user: User): Promise<ProductDTO[]> {
		const end = this.requestDuration.startTimer({ method: 'GET', route: '/products', status: '200' })
		this.logger.log(`GET /products by user ${user.id}`)
		const result = await this.productsService.findAll()
		end()
		return result
	}
	@Roles('api_orders', 'admin', 'manager', 'distributor', 'customer')
	@Get('/:id')
	async findById(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<ProductDTO> {
		// TODO: function prettyUser that returns a string with user info (id, user, mail) if user is undefined, it should be a request from another microservice
		const end = this.requestDuration.startTimer({ method: 'GET', route: '/products/:id', status: '200' })
		this.logger.log(`GET /products/${id} by user ${user.id}`)
		const result = await this.productsService.findById(id)
		end()
		return result
	}
}
