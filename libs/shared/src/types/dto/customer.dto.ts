import { IsString, IsNumber, IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';



class addressDTO {
  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;
}


class profileDTO {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;
}

class companyDTO {
  @IsOptional()
  @IsString()
  companyName?: string;
}

export class CustomerDTO {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @ValidateNested()
  @Type(() => addressDTO)
  address: addressDTO;

  @ValidateNested()
  @Type(() => profileDTO)
  profile: profileDTO;

  @ValidateNested()
  @Type(() => companyDTO)
  company: companyDTO;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;
}

export class CreateCustomerDTO {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @ValidateNested()
  @Type(() => addressDTO)
  address: addressDTO;

  @ValidateNested()
  @Type(() => profileDTO)
  profile: profileDTO;

  @ValidateNested()
  @Type(() => companyDTO)
  company: companyDTO;
}

export class UpdateCustomerDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => addressDTO)
  address?: addressDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => profileDTO)
  profile?: profileDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => companyDTO)
  company?: companyDTO;
}
