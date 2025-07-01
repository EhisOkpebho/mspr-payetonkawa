import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class DetailsDTO {
	@IsOptional()
	@IsNumber()
	price?: number

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsString()
	color?: string
}

export class ProductDTO {
	@IsNumber()
	id: number

	@IsString()
	name: string

	@ValidateNested()
	@Type(() => DetailsDTO)
	details: DetailsDTO

	@IsNumber()
	stock: number

	@Type(() => Date)
	createdAt: Date

	@Type(() => Date)
	updatedAt: Date
}

export class CreateProductDTO {
	@IsString()
	@IsNotEmpty()
	name: string

	@ValidateNested()
	@Type(() => DetailsDTO)
	details: DetailsDTO

	@IsNumber()
	stock: number
}

export class UpdateProductDTO {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@ValidateNested()
	@Type(() => DetailsDTO)
	details?: DetailsDTO

	@IsOptional()
	@IsNumber()
	stock?: number
}
