import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  customerId?: number;
}

export type UpdateOrderDto = Partial<CreateOrderDto>