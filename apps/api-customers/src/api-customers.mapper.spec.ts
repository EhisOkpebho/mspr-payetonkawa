import { Customer } from '@app/shared/entities/customer.entity'
import { CustomerDTO } from '@app/shared/types/dto/customer.dto'
import { toCustomerDTO, toCustomerEntity } from './api-customers.mapper'

describe('api-customers.mapper', () => {
	const date = new Date('2024-01-01T00:00:00.000Z')

	describe('toCustomerDTO', () => {
		it('should map Customer to CustomerDTO', () => {
			const entity = new Customer()
			entity.id = 1
			entity.name = 'Acme'
			entity.username = 'acme_user'
			entity.firstName = 'John'
			entity.lastName = 'Doe'
			entity.postalCode = '12345'
			entity.city = 'Paris'
			entity.companyName = 'Acme Corp'
			entity.createdAt = date
			entity.updatedAt = date

			const dto = toCustomerDTO(entity)

			expect(dto).toEqual({
				id: 1,
				name: 'Acme',
				username: 'acme_user',
				firstName: 'John',
				lastName: 'Doe',
				address: { postalCode: '12345', city: 'Paris' },
				profile: { firstName: 'John', lastName: 'Doe' },
				company: { companyName: 'Acme Corp' },
				createdAt: date,
				updatedAt: date,
			})
		})
	})

	describe('toCustomerEntity', () => {
		it('should map CustomerDTO to Customer', () => {
			const dto: CustomerDTO = {
				id: 2,
				name: 'Beta',
				username: 'beta_user',
				firstName: 'Jane',
				lastName: 'Smith',
				address: { postalCode: '54321', city: 'Lyon' },
				profile: { firstName: 'Jane', lastName: 'Smith' },
				company: { companyName: 'Beta LLC' },
				createdAt: date,
				updatedAt: date,
			}

			const entity = toCustomerEntity(dto)

			expect(entity).toBeInstanceOf(Customer)
			expect(entity).toMatchObject({
				id: 2,
				name: 'Beta',
				username: 'beta_user',
				firstName: 'Jane',
				lastName: 'Smith',
				postalCode: '54321',
				city: 'Lyon',
				companyName: 'Beta LLC',
				createdAt: date,
				updatedAt: date,
			})
		})
	})
})
