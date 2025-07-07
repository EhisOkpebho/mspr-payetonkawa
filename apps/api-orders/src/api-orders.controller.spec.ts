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
			providers: [
				{ provide: ApiOrdersService, useValue: mockService },
				{
					provide: 'PROM_METRIC_HTTP_REQUEST_DURATION_SECONDS',
					useValue: {
						startTimer: () => () => {}, // mock startTimer returning a no-op end function
					},
				},
			],
		}).compile()

		controller = module.get<ApiOrdersController>(ApiOrdersController)
		service = module.get<ApiOrdersService>(ApiOrdersService)

		jest.clearAllMocks()
	})

	describe('create()', () => {
		it('should call ordersService.create and return a PDF response', async () => {
			const dto: CreateOrderDto = {
				productId: 456,
				quantity: 1,
			}

			const user: User = {
				id: 123,
				email: 'test@example.com',
				password: '',
				customer: { id: 123 } as any, // simulate linked customer
				createdAt: new Date(),
				updatedAt: new Date(),
				roles: ['customer'],
			}

			const mockPdfBuffer = Buffer.from('PDF-DATA')
			mockService.create.mockResolvedValue(mockPdfBuffer)

			// Mock Express Response object
			const mockRes = {
				set: jest.fn(),
				send: jest.fn(),
			} as any

			await controller.create(dto, user, mockRes)

			expect(mockService.create).toHaveBeenCalledWith(dto, user.customer)
			expect(mockRes.set).toHaveBeenCalledWith(
				expect.objectContaining({
					'Content-Type': 'application/pdf',
					'Content-Disposition': 'attachment; filename="commande.pdf"',
					'Content-Length': mockPdfBuffer.length,
				}),
			)
			expect(mockRes.send).toHaveBeenCalledWith(mockPdfBuffer)
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
