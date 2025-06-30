import { Customer } from '@app/shared/entities/customer.entity'
import { CustomerDTO } from '@app/shared/types/dto/customer.dto'
import { toCustomerDTO, toCustomerEntity } from './api-customers.mapper'

describe('ApiCustomersMapper', () => {
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

	const mockCustomerDto: CustomerDTO = {
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

	describe('toCustomerDTO', () => {
		it('should map Customer entity to CustomerDTO', () => {
			const dto = toCustomerDTO(mockCustomer)
			expect(dto).toEqual(mockCustomerDto)
		})
	})

	describe('toCustomerEntity', () => {
		it('should map CustomerDTO to Customer entity', () => {
			const entity = toCustomerEntity(mockCustomerDto)
			expect(entity).toEqual(mockCustomer)
		})
	})
})
