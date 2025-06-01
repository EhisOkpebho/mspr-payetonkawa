import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateUserRoleDto } from 'libs/shared/src/types/dto/user-role.dto'
import { UserRole } from '@app/shared/entities/user-role.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Role } from '@app/shared/entities/role.entity'
import { User } from '@app/shared/entities/user.entity'

@Injectable()
export class RolesService {
	constructor(
		@InjectRepository(Role)
		private readonly roleRepo: Repository<Role>,
		@InjectRepository(UserRole)
		private readonly userRoleRepo: Repository<UserRole>,
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	async findAll() {
		return this.roleRepo.find()
	}

	async createPermission(dto: CreateUserRoleDto, grantedBy?: User) {
		const user = await this.userRepo.findOneBy({ id: dto.userId })
		if (!user) throw new BadRequestException('User not found')
		const role = await this.roleRepo.findOneBy({ id: dto.roleId })
		if (!role) throw new BadRequestException('Role not found')
		const userRole = this.userRoleRepo.create({
			user,
			role,
			grantedBy: grantedBy ?? null,
		})
		return this.userRoleRepo.save(userRole)
	}

	async deletePermission(id: number) {
		const res = await this.userRoleRepo.delete(id)
		return res.affected > 0
	}

	async findPermissions() {
		return this.userRoleRepo.find({ relations: ['user', 'role', 'grantedBy'] })
	}

	async findPermissionsByUserId(userId: number) {
		return this.userRoleRepo.find({
			where: { user: { id: userId } },
			relations: ['role', 'grantedBy'],
		})
	}
}
