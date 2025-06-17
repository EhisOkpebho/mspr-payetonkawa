// Todo: use a class-validator DTO for validation

export type CreateOrderDto = {
	productId: number
	quantity?: number
	customerId?: number
}

// Todo: use a class-validator DTO for validation

export type UpdateOrderDto = Partial<CreateOrderDto>
