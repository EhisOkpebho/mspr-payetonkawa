import { IsNumber } from 'class-validator'

export class CreateUserRoleDto {
	@IsNumber()
	userId: number

	roleId: string | number
}
