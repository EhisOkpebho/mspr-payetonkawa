import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiProductsService } from './api-products.service'

@Controller('products')
export class ApiProductsController {
	private readonly logger = new Logger(ApiProductsController.name)

	constructor(private readonly productsService: ApiProductsService) {}

	@Post()
	create(@Body() product: CreateProductDTO): Promise<ProductDTO> {
		this.logger.log('POST /products')
		return this.productsService.create(product)
	}

	@Put('/:id')
	update(@Param('id', ParseIntPipe) id: number, @Body() product: UpdateProductDTO): Promise<ProductDTO> {
		this.logger.log(`PUT /products/${id}`)
		return this.productsService.update(id, product)
	}

	@Delete('/:id')
	delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
		this.logger.log(`DELETE /products/${id}`)
		return this.productsService.delete(id)
	}

	@Get()
	findAll(): Promise<ProductDTO[]> {
		this.logger.log('GET /products')
		return this.productsService.findAll()
	}

	@Get('/:id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<ProductDTO> {
		this.logger.log(`GET /products/${id}`)
		return this.productsService.findById(id)
	}
}
