import { Test, TestingModule } from '@nestjs/testing'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'
import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { User } from '@app/shared/entities/user.entity'

describe('ApiOrdersController', () => {
	let controller: ApiOrdersController
	let service: ApiOrdersService

	const mockOrder: Order = {
		id: 1,
		customerId: 123,
		productId: 456,
		quantity: 1,
		createdAt: new Date(),
	}

	const mockService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findById: jest.fn(),
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ApiOrdersController],
			providers: [{ provide: ApiOrdersService, useValue: mockService }],
		}).compile()

		controller = module.get<ApiOrdersController>(ApiOrdersController)
		service = module.get<ApiOrdersService>(ApiOrdersService)

		jest.clearAllMocks()
	})

	describe('create()', () => {
		it('should call ordersService.create with merged order and user ID', async () => {
			const dto: CreateOrderDto = {
				productId: 456,
				quantity: 1,
				customerId: 123,
			}

			const user: User = {
				id: 123,
				email: 'test@example.com',
				password: '',
				customer: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				roles: ['customer'],
			}

			mockService.create.mockResolvedValue(mockOrder)

			const result = await controller.create(dto, user)
			expect(result).toEqual(mockOrder)
			expect(service.create).toHaveBeenCalledWith({ ...dto, customerId: user.id })
		})
	})

	describe('findAll()', () => {
		it('should return all orders', async () => {
			mockService.findAll.mockResolvedValue([mockOrder])

			const result = await controller.findAll()
			expect(result).toEqual([mockOrder])
			expect(service.findAll).toHaveBeenCalled()
		})
	})

	describe('findById()', () => {
		it('should return a single order by ID', async () => {
			mockService.findById.mockResolvedValue(mockOrder)

			const result = await controller.findById(1)
			expect(result).toEqual(mockOrder)
			expect(service.findById).toHaveBeenCalledWith(1)
		})
	})
})
