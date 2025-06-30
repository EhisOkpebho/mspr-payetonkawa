import { IsNumber, IsOptional } from 'class-validator'

export class CreateOrderDto {
	@IsNumber()
	productId: number

	@IsOptional()
	@IsNumber()
	quantity?: number

	@IsOptional()
	customerId?: number
}

export type UpdateOrderDto = Partial<CreateOrderDto>
