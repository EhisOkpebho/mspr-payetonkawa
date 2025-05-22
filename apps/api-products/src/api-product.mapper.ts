import { Product } from '@app/shared/entities/product.entity'
import { ProductDTO } from '@app/shared/types/dto/product.dto'

export function toProductDTO(entity: Product) {
	return {
		id: entity.id,
		name: entity.name,
		details: {
			price: entity.price,
			description: entity.description,
			color: entity.color,
		},
		stock: entity.stock,
		updatedAt: entity.updatedAt,
		createdAt: entity.createdAt,
	}
}

export function toProductEntity(dto: ProductDTO): Product {
	const entity = new Product()
	entity.id = dto?.id
	entity.name = dto?.name
	entity.price = dto?.details?.price
	entity.description = dto?.details?.description
	entity.color = dto?.details?.color
	entity.stock = dto?.stock
	entity.createdAt = dto?.createdAt
	entity.updatedAt = dto?.updatedAt
	return entity
}
