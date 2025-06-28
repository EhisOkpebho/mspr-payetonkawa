import { Test, TestingModule } from '@nestjs/testing'
import { ApiProductsController } from './api-products.controller'
import { ApiProductsService } from './api-products.service'
import { ProductDTO, CreateProductDTO, UpdateProductDTO } from '@app/shared/types/dto/product.dto'
import { Order } from '@app/shared/entities/order.entity'
import { User } from '@app/shared/entities/user.entity'
import { Customer } from '@app/shared/entities/customer.entity'

describe('ApiProductsController', () => {
	let controller: ApiProductsController
	let service: ApiProductsService

	const mockProduct: ProductDTO = {
		id: 1,
		name: 'Test Product',
		details: {
			price: 100,
			description: 'desc',
			color: 'red',
		},
		stock: 10,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockUser: User = {
		id: 1,
		email: 'test@example.com',
		password: '',
		roles: ['admin'],
		createdAt: new Date(),
		updatedAt: new Date(),
		customer: new Customer(),
	}

	const serviceMock = {
		create: jest.fn().mockResolvedValue(mockProduct),
		update: jest.fn().mockResolvedValue({ ...mockProduct, stock: 7 }),
		delete: jest.fn().mockResolvedValue(true),
		findAll: jest.fn().mockResolvedValue([mockProduct]),
		findById: jest.fn().mockResolvedValue(mockProduct),
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ApiProductsController],
			providers: [
				{
					provide: ApiProductsService,
					useValue: serviceMock,
				},
			],
		}).compile()

		controller = module.get<ApiProductsController>(ApiProductsController)
		service = module.get<ApiProductsService>(ApiProductsService)
		jest.clearAllMocks()
	})

	describe('handleOrderCreated', () => {
		it('should update stock if product exists', async () => {
			const order: Order = {
				id: 123,
				customerId: 1,
				productId: 1,
				quantity: 3,
				createdAt: new Date(),
			}
			await controller.handleOrderCreated({ order })
			expect(service.findById).toHaveBeenCalledWith(order.productId)
			expect(service.update).toHaveBeenCalledWith(order.productId, { stock: 7 }) // 10 - 3
		})

		it('should not update stock if product is not found', async () => {
			jest.spyOn(service, 'findById').mockResolvedValueOnce(null)
			const order: Order = {
				id: 123,
				customerId: 1,
				productId: 999,
				quantity: 1,
				createdAt: new Date(),
			}
			await controller.handleOrderCreated({ order })
			expect(service.update).not.toHaveBeenCalled()
		})
	})

	describe('create', () => {
		it('should create a product', async () => {
			const dto: CreateProductDTO = {
				name: 'New Product',
				details: {
					price: 99,
					description: 'Cool',
					color: 'blue',
				},
				stock: 10,
			}
			const result = await controller.create(dto, mockUser)
			expect(result).toEqual(mockProduct)
			expect(service.create).toHaveBeenCalledWith(dto)
		})
	})

	describe('update', () => {
		it('should update a product', async () => {
			const dto: UpdateProductDTO = { stock: 20 }
			const result = await controller.update(1, dto, mockUser)
			expect(result).toEqual({ ...mockProduct, stock: 7 })
			expect(service.update).toHaveBeenCalledWith(1, dto)
		})
	})

	describe('delete', () => {
		it('should delete a product', async () => {
			const result = await controller.delete(1, mockUser)
			expect(result).toBe(true)
			expect(service.delete).toHaveBeenCalledWith(1)
		})
	})

	describe('findAll', () => {
		it('should return all products', async () => {
			const result = await controller.findAll(mockUser)
			expect(result).toEqual([mockProduct])
			expect(service.findAll).toHaveBeenCalled()
		})
	})

	describe('findById', () => {
		it('should return product by ID', async () => {
			const result = await controller.findById(1, mockUser)
			expect(result).toEqual(mockProduct)
			expect(service.findById).toHaveBeenCalledWith(1)
		})
	})
})
