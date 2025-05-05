export type FindProductByIdDto = {
	id: number
}

export type CreateProductDto = {
	name: string
	details: {
		price: string
		description: string
		color: string
	}
	stock: number
}

export type UpdateProductDto = Partial<CreateProductDto>
