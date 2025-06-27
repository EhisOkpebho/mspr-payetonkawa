import { Test, TestingModule } from '@nestjs/testing'
import { ApiCustomersService } from './api-customers.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Customer } from '@app/shared/entities/customer.entity'
import { User } from '@app/shared/entities/user.entity'
import { Repository } from 'typeorm'
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { CreateCustomerDTO } from '@app/shared/types/dto/customer.dto'

const mockRepository = () => ({
	save: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	find: jest.fn(),
	findOne: jest.fn(),
})

describe('ApiCustomersService', () => {
	let service: ApiCustomersService
	let customerRepository: jest.Mocked<Repository<Customer>>

	const now = new Date()

	const mockCustomer: Customer = {
		id: 1,
		name: 'John DOE',
		username: 'JD',
		firstName: 'John',
		lastName: 'DOE',
		postalCode: '59000',
		city: 'Lille',
		companyName: 'EPSI',
		user: undefined,
		createdAt: now,
		updatedAt: now,
	}

	const mockUser: User = {
		id: 1,
		email: 'admin@example.com',
		password: 'hashed',
		roles: ['admin'],
		createdAt: now,
		updatedAt: now,
		customer: mockCustomer,
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApiCustomersService,
				{
					provide: getRepositoryToken(Customer),
					useFactory: mockRepository,
				},
			],
		}).compile()

		service = module.get<ApiCustomersService>(ApiCustomersService)
		customerRepository = module.get(getRepositoryToken(Customer))
	})

	describe('create', () => {
		it('should throw if user already has a customer', async () => {
			await expect(service.create({} as CreateCustomerDTO, mockUser)).rejects.toThrow(ConflictException)
		})

		it('should create and return a customer DTO', async () => {
			const userWithoutCustomer = { ...mockUser, customer: undefined }
			customerRepository.save.mockResolvedValueOnce(mockCustomer)

			const dto: CreateCustomerDTO = {
				name: 'John DOE',
				username: 'JD',
				firstName: 'John',
				lastName: 'DOE',
				address: {
					postalCode: '59000',
					city: 'Lille',
				},
				profile: {
					username: 'JD',
					firstName: 'John',
				},
				company: {
					companyName: 'Lille',
				},
			}

			const result = await service.create(dto, userWithoutCustomer)
			expect(customerRepository.save).toHaveBeenCalled()
			expect(result).toMatchObject({ id: mockCustomer.id })
		})
	})

	describe('update', () => {
		it('should throw if user has no customer and is not admin', async () => {
			const user = { ...mockUser, customer: undefined, roles: [] }
			await expect(service.update(1, {}, user)).rejects.toThrow(NotFoundException)
		})

		it('should throw if user tries to update another customer without admin role', async () => {
			const user = { ...mockUser, roles: [], customer: { ...mockCustomer, id: 99 } }
			await expect(service.update(1, {}, user)).rejects.toThrow(ForbiddenException)
		})

		it('should update and return customer', async () => {
			customerRepository.findOne.mockResolvedValue(mockCustomer)
			customerRepository.update.mockResolvedValue(undefined)
			const result = await service.update(1, {}, mockUser)
			expect(result).toMatchObject({ id: mockCustomer.id })
		})
	})

	describe('delete', () => {
		it('should throw if user has no customer', async () => {
			const user = { ...mockUser, customer: undefined, roles: [] }
			await expect(service.delete(1, user)).rejects.toThrow(NotFoundException)
		})

		it('should throw if user tries to delete another customer without admin role', async () => {
			const user = { ...mockUser, roles: [], customer: { ...mockCustomer, id: 2 } }
			await expect(service.delete(1, user)).rejects.toThrow(ForbiddenException)
		})

		it('should delete and return true', async () => {
			customerRepository.findOne.mockResolvedValue(mockCustomer)
			customerRepository.delete.mockResolvedValue({ affected: 1 } as any)

			const result = await service.delete(1, mockUser)
			expect(result).toBe(true)
		})
	})

	describe('findAll', () => {
		it('should return an array of customers', async () => {
			customerRepository.find.mockResolvedValue([mockCustomer])
			const result = await service.findAll()
			expect(result.length).toBe(1)
			expect(result[0].id).toBe(mockCustomer.id)
		})
	})

	describe('findById', () => {
		it('should throw if customer not found', async () => {
			customerRepository.findOne.mockResolvedValue(null)
			await expect(service.findById(99)).rejects.toThrow(NotFoundException)
		})

		it('should return a customer DTO', async () => {
			customerRepository.findOne.mockResolvedValue(mockCustomer)
			const result = await service.findById(1)
			expect(result.id).toBe(mockCustomer.id)
		})
	})
})
