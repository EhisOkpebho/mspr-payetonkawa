import { Product } from '@app/shared/entities/product.entity'
import { CreateProductDto, FindProductByIdDto, UpdateProductDto } from '@app/shared/types/dto/product.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class ApiProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>
	) {}

	async getProducts(): Promise<Product[]> {
		return this.productRepository.find()
	}

	async getProductById({ id }: FindProductByIdDto): Promise<Product> {
		return this.productRepository.findOne({ where: { id } })
	}

	async createProduct(product: CreateProductDto): Promise<Product> {
		return this.productRepository.save(product)
	}

	async updateProduct({ id }: FindProductByIdDto, product: UpdateProductDto): Promise<Product> {
		await this.productRepository.update(id, product)
		return this.productRepository.findOne({ where: { id } })
	}

	async deleteProduct({ id }: FindProductByIdDto): Promise<boolean> {
		const res = await this.productRepository.delete(id)
		return res.affected > 0
	}
}
