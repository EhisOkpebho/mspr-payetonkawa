import { CreateProductDto, UpdateProductDto } from '@app/shared/types/dto/product.dto'
import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common'
import { ApiProductsService } from './api-products.service'

@Controller('products')
export class ApiProductsController {
	private readonly logger = new Logger(ApiProductsController.name)

	constructor(private readonly productsService: ApiProductsService) {}

	@Get()
	getProducts() {
		this.logger.log('GET /products')
		return this.productsService.getProducts()
	}

	@Get('/:id')
	getProductById(@Param('id') id: string) {
		this.logger.log(`GET /products/${id}`)
		return this.productsService.getProductById({ id: parseInt(id) })
	}

	@Post()
	createProduct(@Body() product: CreateProductDto) {
		this.logger.log('POST /products')
		return this.productsService.createProduct(product)
	}

	@Put('/:id')
	updateProduct(@Param('id') id: string, @Body() product: UpdateProductDto) {
		this.logger.log(`PUT /products/${id}`)
		return this.productsService.updateProduct({ id: parseInt(id) }, product)
	}

	@Delete('/:id')
	deleteProduct(@Param('id') id: string) {
		this.logger.log(`DELETE /products/${id}`)
		return this.productsService.deleteProduct({ id: parseInt(id) })
	}
}
