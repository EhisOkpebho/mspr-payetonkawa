import { Test, TestingModule } from '@nestjs/testing'
import { ApiProductsService } from './api-products.service'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Product } from '@app/shared/entities/product.entity'
import { NotFoundException } from '@nestjs/common'
import { CreateProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'

// Mocks de produits
const productEntity: Product = {
	id: 1,
	name: 'Test Product',
	price: 100,
	description: 'Test description',
	color: 'Red',
	stock: 10,
	createdAt: new Date(),
	updatedAt: new Date(),
}

const updatedEntity: Product = {
	...productEntity,
	stock: 5,
}

describe('ApiProductsService', () => {
	let service: ApiProductsService
	let repo: jest.Mocked<Repository<Product>>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApiProductsService,
				{
					provide: getRepositoryToken(Product),
					useValue: {
						save: jest.fn(),
						findOne: jest.fn(),
						find: jest.fn(),
						update: jest.fn(),
						delete: jest.fn(),
					},
				},
			],
		}).compile()

		service = module.get<ApiProductsService>(ApiProductsService)
		repo = module.get(getRepositoryToken(Product))
	})

	describe('create', () => {
		it('should create and return a product', async () => {
			repo.save.mockResolvedValue(productEntity)
			const dto: CreateProductDTO = {
				name: 'Test Product',
				details: {
					price: 100,
					description: 'Test description',
					color: 'Red',
				},
				stock: 10,
			}
			const result = await service.create(dto)
			expect(result).toMatchObject({ id: 1, name: 'Test Product', stock: 10 })
			expect(repo.save).toHaveBeenCalled()
		})
	})

	describe('update', () => {
		it('should throw NotFoundException if product not found', async () => {
			repo.findOne.mockResolvedValueOnce(null)
			await expect(service.update(999, { stock: 1 })).rejects.toThrow(NotFoundException)
		})
	})

	describe('delete', () => {
		// it('should delete and return true', async () => {
		// 	repo.findOne.mockResolvedValue(productEntity)
		// 	repo.delete.mockResolvedValue({ affected: 1 })
		// 	const result = await service.delete(1)
		// 	expect(result).toBe(true)
		// })
		//
		// it('should delete and return false if not affected', async () => {
		// 	repo.findOne.mockResolvedValue(productEntity)
		// 	repo.delete.mockResolvedValue({ affected: 0 })
		// 	const result = await service.delete(1)
		// 	expect(result).toBe(false)
		// })

		it('should throw NotFoundException if product not found', async () => {
			repo.findOne.mockResolvedValue(null)
			await expect(service.delete(1)).rejects.toThrow(NotFoundException)
		})
	})

	describe('findAll', () => {
		it('should return all products', async () => {
			repo.find.mockResolvedValue([productEntity])
			const result = await service.findAll()
			expect(result.length).toBe(1)
			expect(result[0].name).toBe('Test Product')
		})
	})

	describe('findById', () => {
		it('should return a product by id', async () => {
			repo.findOne.mockResolvedValue(productEntity)
			const result = await service.findById(1)
			expect(result.name).toBe('Test Product')
		})

		it('should throw NotFoundException if not found', async () => {
			repo.findOne.mockResolvedValue(null)
			await expect(service.findById(1)).rejects.toThrow(NotFoundException)
		})
	})
})
