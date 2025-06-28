import { IsString, IsNumber, IsOptional, IsNotEmpty, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ProductDetailsDTO {
  @IsNumber()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  color: string;
}


class UpdateProductDetailsDTO {
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => ProductDetailsDTO)
  details: ProductDetailsDTO;

  @IsNumber()
  stock: number;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProductDetailsDTO)
  details?: UpdateProductDetailsDTO;

  @IsOptional()
  @IsNumber()
  stock?: number;
}
