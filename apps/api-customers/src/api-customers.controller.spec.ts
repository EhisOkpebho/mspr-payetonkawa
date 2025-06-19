import { Test, TestingModule } from '@nestjs/testing'
import { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@app/shared/types/dto/customer.dto'
import { User } from '@app/shared/entities/user.entity'
import { ApiCustomersController } from './api-customers.controller'
import { ApiCustomersService } from './api-customers.service'

describe('ApiCustomersController', () => {
	let controller: ApiCustomersController
	let service: ApiCustomersService

	const now = new Date()
	const mockCustomer: CustomerDTO = {
		id: 1,
		name: 'John DOE',
		username: 'JD',
		firstName: 'John',
		lastName: 'DOE',
		address: {
			postalCode: '59000',
			city: 'Lille',
		},
		profile: {
			firstName: 'John',
			lastName: 'DOE',
		},
		company: {
			companyName: 'EPSI',
		},
		createdAt: now,
		updatedAt: now,
	}

	const mockUser: User = {
		id: 1,
		email: 'admin@example.com',
		password: 'mySuperHashedPassword',
		roles: ['admin'],
		createdAt: now,
		updatedAt: now,
		customer: undefined,
	}

	const mockService = {
		create: jest.fn().mockResolvedValue(mockCustomer),
		update: jest.fn().mockResolvedValue(mockCustomer),
		delete: jest.fn().mockResolvedValue(true),
		findAll: jest.fn().mockResolvedValue([mockCustomer]),
		findById: jest.fn().mockResolvedValue(mockCustomer),
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ApiCustomersController],
			providers: [
				{
					provide: ApiCustomersService,
					useValue: mockService,
				},
			],
		}).compile()

		controller = module.get<ApiCustomersController>(ApiCustomersController)
		service = module.get<ApiCustomersService>(ApiCustomersService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	it('should create a customer', async () => {
		const dto: CreateCustomerDTO = {
			name: 'John DOE',
			username: 'JD',
			firstName: 'John',
			lastName: 'Doe',
			address: {
				postalCode: '59000',
				city: 'Lille',
			},
			profile: {
				username: 'John',
				firstName: 'DOE',
			},
			company: {
				companyName: 'EPSI',
			},
		}

		const result = await controller.create(dto, mockUser)
		expect(service.create).toHaveBeenCalledWith(dto, mockUser)
		expect(result).toEqual(mockCustomer)
	})

	it('should update a customer', async () => {
		const dto: UpdateCustomerDTO = {
			name: 'John DOE',
			address: {
				city: "Villeneuve d'ascq",
			},
			profile: {
				firstName: 'Johnattan',
			},
		}

		const result = await controller.update(1, dto, mockUser)
		expect(service.update).toHaveBeenCalledWith(1, dto, mockUser)
		expect(result).toEqual(mockCustomer)
	})

	it('should delete a customer', async () => {
		const result = await controller.delete(1, mockUser)
		expect(service.delete).toHaveBeenCalledWith(1, mockUser)
		expect(result).toBe(true)
	})

	it('should find all customers (admin)', async () => {
		const result = await controller.findAll()
		expect(service.findAll).toHaveBeenCalled()
		expect(result).toEqual([mockCustomer])
	})

	it('should find a customer by id (admin)', async () => {
		const result = await controller.findById(1)
		expect(service.findById).toHaveBeenCalledWith(1)
		expect(result).toEqual(mockCustomer)
	})
})
