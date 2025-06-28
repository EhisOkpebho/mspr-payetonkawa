import { IsString, IsNumber, IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDTO {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => detailsDTO)
  details: detailsDTO;

  @IsNumber()
  stock: number;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;
}

class detailsDTO {
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
  @Type(() => detailsDTO)
  details: detailsDTO;

  @IsNumber()
  stock: number;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => detailsDTO)
  details?: detailsDTO;

  @IsOptional()
  @IsNumber()
  stock?: number;
}
