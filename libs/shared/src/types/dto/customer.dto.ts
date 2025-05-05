export type FindCustomerByIdDto = {
	id: number
}

export type CreateCustomerDto = {
	name: string
	username: string
	firstName: string
	lastName: string
	address: { postalCode: string; city: string }
	profile: { firstName: string; lastName: string }
	company: { companyName: string }
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>
