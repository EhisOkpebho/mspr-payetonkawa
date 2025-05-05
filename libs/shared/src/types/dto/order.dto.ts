export type FindOrderByIdDto = {
	id: number
}

export type CreateOrderDto = {
	customerId: number
	productId: number
}

export type UpdateOrderDto = Partial<CreateOrderDto>
