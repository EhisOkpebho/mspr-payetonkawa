import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { RolesService } from './roles.service'
import { CreateUserRoleDto } from 'libs/shared/src/types/dto/user-role.dto'
import { AuthGuard } from '../_guards/auth.guard'
import { Roles } from '../_decorators/roles.decorator'
import { ReqUser } from '../_decorators/user.decorator'
import { User } from '@app/shared/entities/user.entity'

@Roles('admin')
@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@Get()
	findAll() {
		return this.rolesService.findAll()
	}

	@Post('permissions')
	createPermission(@Body() dto: CreateUserRoleDto, @ReqUser() user: User) {
		return this.rolesService.createPermission(dto, user)
	}

	@Delete('permissions/:id')
	deletePermission(@Param('id', ParseIntPipe) id: string) {
		return this.rolesService.deletePermission(Number(id))
	}

	@Get('permissions/:userId')
	findPermissionsByUserId(@Param('userId', ParseIntPipe) userId: string) {
		return this.rolesService.findPermissionsByUserId(Number(userId))
	}

	@Get('permissions')
	findPermissions() {
		return this.rolesService.findPermissions()
	}
}
