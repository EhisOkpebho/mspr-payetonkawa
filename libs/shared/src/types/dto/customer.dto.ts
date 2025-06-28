import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDTO {
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}

class ProfileDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;
}

class CompanyDTO {
  @IsString()
  @IsNotEmpty()
  companyName: string;
}

export class CreateCustomerDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ValidateNested()
  @Type(() => AddressDTO)
  address: AddressDTO;

  @ValidateNested()
  @Type(() => ProfileDTO)
  profile: ProfileDTO;

  @ValidateNested()
  @Type(() => CompanyDTO)
  company: CompanyDTO;
}

class UpdateAddressDTO {
  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;
}

class UpdateCompanyDTO {
  @IsOptional()
  @IsString()
  companyName?: string;
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
  @Type(() => UpdateAddressDTO)
  address?: UpdateAddressDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDTO)
  profile?: UpdateProfileDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCompanyDTO)
  company?: UpdateCompanyDTO;
}
