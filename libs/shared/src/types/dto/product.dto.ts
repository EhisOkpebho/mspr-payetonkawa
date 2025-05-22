export type ProductDTO = {
	id: number
	name: string
	details: {
		price: number
		description: string
		color: string
	}
	stock: number
	createdAt: Date
	updatedAt: Date
}

export type CreateProductDTO = {
	name: string
	details: {
		price: number
		description: string
		color: string
	}
	stock: number
}

export type UpdateProductDTO = {
	name?: string
	details?: {
		price?: number
		description?: string
		color?: string
	}
	stock?: number
}
