import { Product } from '@app/shared/entities/product.entity'
import { ProductDTO } from '@app/shared/types/dto/product.dto'
import { toProductDTO, toProductEntity } from './api-products.mapper'

describe('api-products.mapper', () => {
	const date = new Date('2024-01-01T00:00:00.000Z')

	describe('toProductDTO', () => {
		it('should map Product to ProductDTO', () => {
			const entity = new Product()
			entity.id = 1
			entity.name = 'Coffee'
			entity.price = 250
			entity.description = 'Freshly brewed dark roast coffee'
			entity.color = 'dark brown'
			entity.stock = 100
			entity.createdAt = date
			entity.updatedAt = date

			const dto = toProductDTO(entity)

			expect(dto).toEqual({
				id: 1,
				name: 'Coffee',
				details: {
					price: 250,
					description: 'Freshly brewed dark roast coffee',
					color: 'dark brown',
				},
				stock: 100,
				createdAt: date,
				updatedAt: date,
			})
		})
	})

	describe('toProductEntity', () => {
		it('should map ProductDTO to Product', () => {
			const dto: ProductDTO = {
				id: 2,
				name: 'Latte',
				details: {
					price: 300,
					description: 'Creamy steamed milk with espresso',
					color: 'light brown',
				},
				stock: 50,
				createdAt: date,
				updatedAt: date,
			}

			const entity = toProductEntity(dto)

			expect(entity).toBeInstanceOf(Product)
			expect(entity).toMatchObject({
				id: 2,
				name: 'Latte',
				price: 300,
				description: 'Creamy steamed milk with espresso',
				color: 'light brown',
				stock: 50,
				createdAt: date,
				updatedAt: date,
			})
		})
	})
})
