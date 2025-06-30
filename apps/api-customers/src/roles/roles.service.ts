import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'
import { User } from '@app/shared/entities/user.entity'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserRoleDto } from 'libs/shared/src/types/dto/user-role.dto'
import { Repository } from 'typeorm'

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

		const role = await this.roleRepo.findOneBy(typeof dto.roleId === 'number' ? { id: dto.roleId } : { name: dto.roleId })

		if (!role) throw new BadRequestException('Role not found')

		const userRole = this.userRoleRepo.create({
			user,
			role,
			grantedBy: grantedBy ?? null,
		})
		return this.userRoleRepo.save(userRole)
	}

	async deletePermission(id: number) {
		await this.findPermissionById(id)
		const res = await this.userRoleRepo.delete(id)
		return res.affected > 0
	}

	async findPermissionById(id: number) {
		const permission = await this.userRoleRepo.findOne({
			where: { id },
			relations: ['user', 'role', 'grantedBy'],
		})
		if (!permission) {
			throw new NotFoundException(`Permission with id ${id} not found`)
		}
		return permission
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
