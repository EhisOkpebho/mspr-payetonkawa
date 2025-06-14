import { Product } from '@app/shared/entities/product.entity'
import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { toProductDTO, toProductEntity } from 'apps/api-products/src/api-products.mapper'
import { Repository } from 'typeorm'

@Injectable()
export class ApiProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
	) {}

	async create(product: CreateProductDTO): Promise<ProductDTO> {
		const created = await this.productRepository.save(product)
		return toProductDTO(created)
	}

	async update(id: number, product: UpdateProductDTO): Promise<ProductDTO> {
		await this.findById(id)
		await this.productRepository.update(id, toProductEntity(product as ProductDTO))
		const updated = await this.productRepository.findOne({ where: { id } })
		return toProductDTO(updated)
	}

	async delete(id: number): Promise<boolean> {
		await this.findById(id)
		const res = await this.productRepository.delete(id)
		return res.affected > 0
	}

	async findAll(): Promise<ProductDTO[]> {
		const products = await this.productRepository.find()
		return products.map(toProductDTO)
	}

	async findById(id: number): Promise<ProductDTO> {
		const product = await this.productRepository.findOne({ where: { id } })
		if (!product) {
			throw new NotFoundException(`Product with id ${id} not found`)
		}
		return toProductDTO(await this.productRepository.findOne({ where: { id } }))
	}
}
