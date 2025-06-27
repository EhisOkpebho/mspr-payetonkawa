import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { AuthGuard } from '@app/shared/_guards/auth.guard'
import { User } from '@app/shared/entities/user.entity'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { CreateUserRoleDto } from 'libs/shared/src/types/dto/user-role.dto'
import { RolesService } from './roles.service'

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
