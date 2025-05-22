export type CustomerDTO = {
	id: number
	name: string
	username: string
	firstName: string
	lastName: string
	address: {
		postalCode: string
		city: string
	}
	profile: {
		firstName: string
		lastName: string
	}
	company: {
		companyName: string
	}
	createdAt: Date
	updatedAt: Date
}

export type CreateCustomerDTO = {
	name: string
	username: string
	firstName: string
	lastName: string
	address: {
		postalCode: string
		city: string
	}
	profile: {
		username: string
		firstName: string
	}
	company: {
		companyName: string
	}
}

export type UpdateCustomerDTO = {
	name?: string
	firstName?: string
	lastName?: string
	address?: {
		postalCode?: string
		city?: string
	}
	profile?: {
		username?: string
		firstName?: string
	}
	company?: {
		companyName?: string
	}
}
