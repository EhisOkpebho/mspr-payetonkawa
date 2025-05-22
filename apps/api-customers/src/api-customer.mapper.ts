import { Customer } from '@app/shared/entities/customer.entity'
import { CustomerDTO } from '@app/shared/types/dto/customer.dto'

export function toCustomerDTO(entity: Customer) {
	return {
		id: entity.id,
		name: entity.name,
		username: entity.username,
		firstName: entity.firstName,
		lastName: entity.lastName,
		address: {
			postalCode: entity.postalCode,
			city: entity.city,
		},
		profile: {
			firstName: entity.firstName,
			lastName: entity.lastName,
		},
		company: {
			companyName: entity.companyName,
		},
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
	}
}

export function toCustomerEntity(dto: CustomerDTO): Customer {
	const entity = new Customer()
	entity.id = dto?.id
	entity.name = dto?.name
	entity.username = dto?.username
	entity.firstName = dto?.firstName
	entity.lastName = dto?.lastName
	entity.postalCode = dto?.address?.postalCode
	entity.city = dto?.address?.city
	entity.companyName = dto?.company?.companyName
	entity.createdAt = dto?.createdAt
	entity.updatedAt = dto?.updatedAt
	return entity
}
