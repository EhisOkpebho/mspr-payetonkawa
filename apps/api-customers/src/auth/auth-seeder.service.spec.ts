import { AuthSeederService } from './auth-seeder.service'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { ConflictException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from '@app/shared/entities/user.entity'
import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'

jest.mock('@nestjs/common', () => {
	const actual = jest.requireActual('@nestjs/common')
	return {
		...actual,
		Logger: jest.fn().mockImplementation(() => ({
			log: jest.fn(),
			error: jest.fn(),
		})),
	}
})

describe('AuthSeederService', () => {
	let service: AuthSeederService
	let userRepo: Partial<Repository<User>>
	let roleRepo: Partial<Repository<Role>>
	let userRoleRepo: Partial<Repository<UserRole>>
	let configService: Partial<ConfigService>
	let authService: Partial<AuthService>

	beforeEach(() => {
		userRepo = {
			count: jest.fn(),
			findOne: jest.fn(),
			save: jest.fn(),
			create: jest.fn().mockImplementation((input: any) => input),
		}
		roleRepo = {
			findOneBy: jest.fn(),
			save: jest.fn(),
			create: jest.fn().mockImplementation((input: any) => input),
		}
		userRoleRepo = {
			findOne: jest.fn(),
			save: jest.fn(),
			create: jest.fn().mockImplementation((input: any) => input),
		}
		configService = {
			get: jest.fn((key: string) => {
				const values = {
					DEFAULT_ROLES: 'admin,user',
					DEFAULT_EMAIL: 'admin@example.com',
					DEFAULT_PASSWORD: 'securePass123',
				}
				return values[key]
			}),
		}
		authService = {
			signUp: jest.fn(),
		}

		service = new AuthSeederService(
			userRepo as Repository<User>,
			roleRepo as Repository<Role>,
			userRoleRepo as Repository<UserRole>,
			configService as ConfigService,
			authService as AuthService,
		)
	})

	it('should seed roles and admin user when DB is empty', async () => {
		;(userRepo.count as jest.Mock).mockResolvedValue(0)
		;(roleRepo.findOneBy as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(null)
		;(roleRepo.save as jest.Mock).mockResolvedValue({})
		;(authService.signUp as jest.Mock).mockResolvedValue({ id: 1, email: 'admin@example.com' })
		;(roleRepo.findOneBy as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1, name: 'admin' })
		;(userRoleRepo.findOne as jest.Mock).mockResolvedValue(null)
		;(userRoleRepo.save as jest.Mock).mockResolvedValue({})

		await service.onApplicationBootstrap()

		expect(roleRepo.save).toHaveBeenCalledTimes(2)
		expect(authService.signUp).toHaveBeenCalled()
	})

	it('should handle ConflictException and continue with existing user', async () => {
		;(userRepo.count as jest.Mock).mockResolvedValue(0)
		;(roleRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'admin' })
		;(authService.signUp as jest.Mock).mockRejectedValue(new ConflictException())
		;(userRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, email: 'admin@example.com' })
		;(userRoleRepo.findOne as jest.Mock).mockResolvedValue(null)
		;(userRoleRepo.save as jest.Mock).mockResolvedValue({})

		await service.onApplicationBootstrap()

		expect(userRepo.findOne).toHaveBeenCalled()
		expect(userRoleRepo.save).toHaveBeenCalled()
	})

	it('should skip role creation if they already exist', async () => {
		;(userRepo.count as jest.Mock).mockResolvedValue(1)
		;(userRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 })
		;(roleRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'admin' })
		;(userRoleRepo.findOne as jest.Mock).mockResolvedValue({})

		await service.onApplicationBootstrap()

		expect(roleRepo.save).not.toHaveBeenCalled()
		expect(userRoleRepo.save).not.toHaveBeenCalled()
	})

	it('should handle error during user creation (not ConflictException)', async () => {
		const error = new Error('Unexpected error')
		;(userRepo.count as jest.Mock).mockResolvedValue(0)
		;(roleRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'admin' })
		;(authService.signUp as jest.Mock).mockRejectedValue(error)

		await service.onApplicationBootstrap()

		expect(authService.signUp).toHaveBeenCalled()
		expect(userRepo.findOne).not.toHaveBeenCalled()
		expect(userRoleRepo.save).not.toHaveBeenCalled()
	})

	it('should log error if admin role not found', async () => {
		;(userRepo.count as jest.Mock).mockResolvedValue(1)
		;(userRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 })
		;(roleRepo.findOneBy as jest.Mock).mockResolvedValue(null)

		await service.onApplicationBootstrap()

		expect(userRoleRepo.save).not.toHaveBeenCalled()
	})
})
