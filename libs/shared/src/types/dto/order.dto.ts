export type FindOrderByIdDto = {
	id: number
}

// Todo: use a class-validator DTO for validation

export type CreateOrderDto = {
	productId: number
	quantity?: number
}

// Todo: use a class-validator DTO for validation

export type UpdateOrderDto = Partial<CreateOrderDto>
