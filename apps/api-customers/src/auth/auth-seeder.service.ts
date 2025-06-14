import { ConflictException, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { User } from '@app/shared/entities/user.entity'
import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'
import { AuthService } from './auth.service'

@Injectable()
export class AuthSeederService implements OnApplicationBootstrap {
	private readonly logger = new Logger(AuthSeederService.name)

	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		@InjectRepository(Role)
		private readonly roleRepo: Repository<Role>,
		@InjectRepository(UserRole)
		private readonly userRoleRepo: Repository<UserRole>,
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
	) {}

	async onApplicationBootstrap() {
		const roleNames = (this.configService.get<string>('DEFAULT_ROLES') || '')
			.split(',')
			.map((r) => r.trim())
			.filter(Boolean)
		const createdRoles: string[] = []
		for (const name of roleNames) {
			const exists = await this.roleRepo.findOneBy({ name })
			if (!exists) {
				await this.roleRepo.save(this.roleRepo.create({ name }))
				createdRoles.push(name)
			}
		}
		if (createdRoles.length > 0) {
			this.logger.log('\x1b[36mCreated roles: ' + createdRoles.join(', ') + '\x1b[0m')
		}

		let adminUser: User
		const userCount = await this.userRepo.count()
		if (userCount === 0) {
			const email = this.configService.get<string>('DEFAULT_EMAIL') || 'admin'
			const password = this.configService.get<string>('DEFAULT_PASSWORD') || 'admin'
			try {
				adminUser = await this.authService.signUp(email, password)
				this.logger.log('\x1b[36mAdmin user created\x1b[0m')
			} catch (e) {
				if (e instanceof ConflictException) {
					adminUser = await this.userRepo.findOne({ where: { email } })
				} else {
					this.logger.error('Failed to create admin user.', e)
					return
				}
			}
		} else {
			adminUser = await this.userRepo.findOne({ order: { id: 'ASC' } })
		}

		const adminRole = await this.roleRepo.findOneBy({ name: 'admin' })
		if (!adminRole) {
			this.logger.error('Admin role not found.')
			return
		}
		const hasAdmin = await this.userRoleRepo.findOne({
			where: { user: { id: adminUser.id }, role: { id: adminRole.id } },
			relations: ['user', 'role'],
		})
		if (!hasAdmin) {
			await this.userRoleRepo.save(
				this.userRoleRepo.create({
					user: adminUser,
					role: adminRole,
					grantedBy: null,
				}),
			)
			this.logger.log('\x1b[36mAdmin role assigned to the default user\x1b[0m')
		}
	}
}
