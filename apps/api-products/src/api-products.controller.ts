import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { Order } from '@app/shared/entities/order.entity'
import { User } from '@app/shared/entities/user.entity'
import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { AuthGuard } from './_guards/auth.guard'
import { ApiProductsService } from './api-products.service'

@Controller('products')
export class ApiProductsController {
	private readonly logger = new Logger(ApiProductsController.name)

	constructor(private readonly productsService: ApiProductsService) {}

	@EventPattern('order.created')
	async handleOrderCreated(@Payload() data: { order: Order }) {
		this.logger.log(`EVENT order.created received with order ID: ${data.order.id}`)
		const product = await this.productsService.findById(data.order.productId)
		if (!product) {
			this.logger.error(`Product with ID ${data.order.productId} not found for order ID: ${data.order.id}`)
			return
		}
		const res = await this.productsService.update(data.order.productId, { stock: product.stock - data.order.quantity })
		this.logger.log(`Stock updated for order ID: ${data.order.id}, (Stock: ${product.stock} -> ${res.stock})`)
	}

	@UseGuards(AuthGuard)
	@Roles('admin', 'manager', 'distributor')
	@Post()
	create(@Body() product: CreateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		this.logger.log(`POST /products by user ${user.id}`)
		return this.productsService.create(product)
	}

	@UseGuards(AuthGuard)
	@Roles('admin', 'manager', 'distributor')
	@Put('/:id')
	update(@Param('id', ParseIntPipe) id: number, @Body() product: UpdateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		this.logger.log(`PUT /products/${id} by user ${user.id}`)
		return this.productsService.update(id, product)
	}

	@UseGuards(AuthGuard)
	@Roles('admin', 'manager', 'distributor')
	@Delete('/:id')
	delete(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<boolean> {
		this.logger.log(`DELETE /products/${id} by user ${user.id}`)
		return this.productsService.delete(id)
	}

	@UseGuards(AuthGuard)
	@Roles('admin', 'manager')
	@Get()
	findAll(@ReqUser() user: User): Promise<ProductDTO[]> {
		this.logger.log(`GET /products by user ${user.id}`)
		return this.productsService.findAll()
	}

	@UseGuards(AuthGuard)
	@Roles('admin', 'manager', 'distributor')
	@Get('/:id')
	findById(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<ProductDTO> {
		this.logger.log(`GET /products/${id} by user ${user.id}`)
		return this.productsService.findById(id)
	}
}
