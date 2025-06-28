import { Test, TestingModule } from '@nestjs/testing'
import { ApiOrdersService } from './api-orders.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Order } from '@app/shared/entities/order.entity'
import { Repository } from 'typeorm'
import { HttpService } from '@nestjs/axios'
import { of, throwError } from 'rxjs'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'

describe('ApiOrdersService', () => {
	let service: ApiOrdersService
	let orderRepository: Repository<Order>
	let httpService: HttpService
	let productsClient: ClientProxy

	const mockOrder: Order = {
		id: 1,
		customerId: 1,
		productId: 1,
		quantity: 2,
		createdAt: new Date(),
	}

	const mockCreateDto: CreateOrderDto = {
		customerId: 1,
		productId: 1,
		quantity: 2,
	}

	const mockProduct = {
		id: 1,
		name: 'Test Product',
		price: 10,
		stock: 5,
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApiOrdersService,
				{
					provide: getRepositoryToken(Order),
					useValue: {
						save: jest.fn().mockResolvedValue(mockOrder),
						find: jest.fn().mockResolvedValue([mockOrder]),
						findOne: jest.fn().mockResolvedValue(mockOrder),
					},
				},
				{
					provide: HttpService,
					useValue: {
						get: jest.fn(),
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key: string) => {
							if (key === 'MS_API_ORDERS_TRUST_KEY') return 'test-key'
							if (key === 'MS_API_PRODUCTS_PORT') return '3002'
							return null
						}),
					},
				},
				{
					provide: 'PRODUCTS_SERVICE',
					useValue: {
						emit: jest.fn().mockReturnValue(of(true)),
					},
				},
			],
		}).compile()

		service = module.get<ApiOrdersService>(ApiOrdersService)
		orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order))
		httpService = module.get<HttpService>(HttpService)
		productsClient = module.get<ClientProxy>('PRODUCTS_SERVICE')
	})

	describe('create', () => {
		it('should create an order successfully', async () => {
			const axiosResponse: AxiosResponse = {
				data: mockProduct,
				status: 200,
				statusText: 'OK',
				headers: {},
				config: {
					headers: undefined,
				},
			}

			jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse))

			const result = await service.create(mockCreateDto)

			expect(result).toEqual(mockOrder)
			expect(orderRepository.save).toHaveBeenCalledWith(mockCreateDto)
			expect(productsClient.emit).toHaveBeenCalled()
		})

		it('should throw NotFoundException if product not found (404)', async () => {
			jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => ({ response: { status: 404 } })))

			await expect(service.create(mockCreateDto)).rejects.toThrow(NotFoundException)
		})

		it('should throw BadRequestException if product service error', async () => {
			jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => ({ response: { status: 500 } })))

			await expect(service.create(mockCreateDto)).rejects.toThrow(BadRequestException)
		})

		it('should throw BadRequestException if product service unreachable', async () => {
			jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => ({ request: {} })))

			await expect(service.create(mockCreateDto)).rejects.toThrow(BadRequestException)
		})

		it('should throw BadRequestException on unexpected error', async () => {
			jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => ({})))

			await expect(service.create(mockCreateDto)).rejects.toThrow(BadRequestException)
		})

		it('should throw BadRequestException if insufficient stock', async () => {
			const lowStockProduct = { ...mockProduct, stock: 1 }
			const axiosResponse: AxiosResponse = {
				data: lowStockProduct,
				status: 200,
				statusText: 'OK',
				headers: {},
				config: {
					headers: undefined,
				},
			}

			jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse))

			await expect(service.create(mockCreateDto)).rejects.toThrow(BadRequestException)
		})
	})

	describe('findAll', () => {
		it('should return all orders', async () => {
			const result = await service.findAll()
			expect(result).toEqual([mockOrder])
			expect(orderRepository.find).toHaveBeenCalled()
		})
	})

	describe('findById', () => {
		it('should return order by ID', async () => {
			const result = await service.findById(1)
			expect(result).toEqual(mockOrder)
			expect(orderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
		})

		it('should throw NotFoundException if order not found', async () => {
			jest.spyOn(orderRepository, 'findOne').mockResolvedValueOnce(null)

			await expect(service.findById(1)).rejects.toThrow(NotFoundException)
		})
	})
})
