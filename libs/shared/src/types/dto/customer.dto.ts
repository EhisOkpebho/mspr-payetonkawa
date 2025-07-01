import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

class AddressDTO {
	@IsOptional()
	@IsString()
	postalCode?: string

	@IsOptional()
	@IsString()
	city?: string
}

class ProfileDTO {
	@IsOptional()
	@IsString()
	username?: string

	@IsOptional()
	@IsString()
	firstName?: string

	@IsOptional()
	@IsString()
	lastName?: string
}

class CompanyDTO {
	@IsOptional()
	@IsString()
	companyName?: string
}

export class CustomerDTO {
	@IsNumber()
	id: number

	@IsString()
	name: string

	@IsString()
	username: string

	@IsString()
	firstName: string

	@IsString()
	lastName: string

	@ValidateNested()
	@Type(() => AddressDTO)
	address: AddressDTO

	@ValidateNested()
	@Type(() => ProfileDTO)
	profile: ProfileDTO

	@ValidateNested()
	@Type(() => CompanyDTO)
	company: CompanyDTO

	@Type(() => Date)
	createdAt: Date

	@Type(() => Date)
	updatedAt: Date
}

export class CreateCustomerDTO {
	@IsString()
	name: string

	@IsString()
	username: string

	@IsString()
	firstName: string

	@IsString()
	lastName: string

	@ValidateNested()
	@Type(() => AddressDTO)
	address: AddressDTO

	@ValidateNested()
	@Type(() => ProfileDTO)
	profile: ProfileDTO

	@ValidateNested()
	@Type(() => CompanyDTO)
	company: CompanyDTO
}

export class UpdateCustomerDTO {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	firstName?: string

	@IsOptional()
	@IsString()
	lastName?: string

	@IsOptional()
	@ValidateNested()
	@Type(() => AddressDTO)
	address?: AddressDTO

	@IsOptional()
	@ValidateNested()
	@Type(() => ProfileDTO)
	profile?: ProfileDTO

	@IsOptional()
	@ValidateNested()
	@Type(() => CompanyDTO)
	company?: CompanyDTO
}
