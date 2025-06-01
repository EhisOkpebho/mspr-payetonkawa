import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { ApiProductsService } from './api-products.service'
import { ReqUser } from './_decorators/user.decorator'
import { User } from '@app/shared/entities/user.entity'
import { AuthGuard } from './_guards/auth.guard'

@UseGuards(AuthGuard)
@Controller('products')
export class ApiProductsController {
	private readonly logger = new Logger(ApiProductsController.name)

	constructor(private readonly productsService: ApiProductsService) {}

	@Post()
	create(@Body() product: CreateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		this.logger.log(`POST /products by user ${user.id}`)
		return this.productsService.create(product)
	}

	@Put('/:id')
	update(@Param('id', ParseIntPipe) id: number, @Body() product: UpdateProductDTO, @ReqUser() user: User): Promise<ProductDTO> {
		this.logger.log(`PUT /products/${id} by user ${user.id}`)
		return this.productsService.update(id, product)
	}

	@Delete('/:id')
	delete(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<boolean> {
		this.logger.log(`DELETE /products/${id} by user ${user.id}`)
		return this.productsService.delete(id)
	}

	@Get()
	findAll(@ReqUser() user: User): Promise<ProductDTO[]> {
		this.logger.log(`GET /products by user ${user.id}`)
		return this.productsService.findAll()
	}

	@Get('/:id')
	findById(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<ProductDTO> {
		this.logger.log(`GET /products/${id} by user ${user.id}`)
		return this.productsService.findById(id)
	}
}
