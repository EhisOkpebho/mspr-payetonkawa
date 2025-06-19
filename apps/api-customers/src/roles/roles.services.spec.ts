import { Test, TestingModule } from '@nestjs/testing'
import { RolesService } from './roles.service'
import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'
import { User } from '@app/shared/entities/user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('RolesService', () => {
	let service: RolesService

	let roleRepo: jest.Mocked<Repository<Role>>
	let userRoleRepo: jest.Mocked<Repository<UserRole>>
	let userRepo: jest.Mocked<Repository<User>>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RolesService,
				{ provide: getRepositoryToken(Role), useValue: createMockRepo() },
				{ provide: getRepositoryToken(UserRole), useValue: createMockRepo() },
				{ provide: getRepositoryToken(User), useValue: createMockRepo() },
			],
		}).compile()

		service = module.get(RolesService)
		roleRepo = module.get(getRepositoryToken(Role))
		userRoleRepo = module.get(getRepositoryToken(UserRole))
		userRepo = module.get(getRepositoryToken(User))
	})

	afterEach(() => jest.clearAllMocks())

	const createMockRepo = () => ({
		find: jest.fn(),
		findOne: jest.fn(),
		findOneBy: jest.fn(),
		findAndCount: jest.fn(),
		findOneOrFail: jest.fn(),
		save: jest.fn(),
		delete: jest.fn(),
		create: jest.fn(),
	})

	describe('findAll', () => {
		it('should return all roles', async () => {
			const roles: Role[] = [
				{
					id: 1,
					name: 'admin',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]
			roleRepo.find.mockResolvedValue(roles)

			const result = await service.findAll()
			expect(result).toEqual(roles)
			expect(roleRepo.find).toHaveBeenCalled()
		})
	})

	describe('createPermission', () => {
		const dto = { userId: 1, roleId: 2 }

		it('should throw if user not found', async () => {
			userRepo.findOneBy.mockResolvedValue(null)

			await expect(service.createPermission(dto)).rejects.toThrow(BadRequestException)
		})

		it('should throw if role not found', async () => {
			userRepo.findOneBy.mockResolvedValue({ id: 1 } as User)
			roleRepo.findOneBy.mockResolvedValue(null)

			await expect(service.createPermission(dto)).rejects.toThrow(BadRequestException)
		})

		it('should create and save user role', async () => {
			const user = { id: 1 } as User
			const role = { id: 2, name: 'admin' } as Role
			const saved: UserRole = {
				id: 1,
				user: user,
				role: role,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			userRepo.findOneBy.mockResolvedValue(user)
			roleRepo.findOneBy.mockResolvedValue(role)
			userRoleRepo.create.mockReturnValue(saved)
			userRoleRepo.save.mockResolvedValue(saved)

			const result = await service.createPermission(dto, user)

			expect(result).toEqual(saved)
			expect(userRoleRepo.create).toHaveBeenCalledWith({ user, role, grantedBy: user })
			expect(userRoleRepo.save).toHaveBeenCalledWith(saved)
		})
	})

	describe('deletePermission', () => {
		it('should delete permission successfully', async () => {
			const permission = { id: 3 }
			jest.spyOn(service, 'findPermissionById').mockResolvedValue(permission as any)
			userRoleRepo.delete.mockResolvedValue({ raw: {}, affected: 1 })

			const result = await service.deletePermission(3)
			expect(result).toBe(true)
			expect(userRoleRepo.delete).toHaveBeenCalledWith(3)
		})

		it('should return false if nothing deleted', async () => {
			jest.spyOn(service, 'findPermissionById').mockResolvedValue({} as any)
			userRoleRepo.delete.mockResolvedValue({ raw: {}, affected: 0 })

			const result = await service.deletePermission(5)
			expect(result).toBe(false)
		})
	})

	describe('findPermissionById', () => {
		it('should throw if not found', async () => {
			userRoleRepo.findOne.mockResolvedValue(null)

			await expect(service.findPermissionById(99)).rejects.toThrow(NotFoundException)
		})

		it('should return the permission', async () => {
			const permission = { id: 1 }
			userRoleRepo.findOne.mockResolvedValue(permission as any)

			const result = await service.findPermissionById(1)
			expect(result).toEqual(permission)
		})
	})

	describe('findPermissions', () => {
		it('should return all permissions with relations', async () => {
			const perms = [{ id: 1, user: {}, role: {}, createdAt: new Date(), updatedAt: new Date() } as UserRole]
			userRoleRepo.find.mockResolvedValue(perms)

			const result = await service.findPermissions()
			expect(result).toEqual(perms)
			expect(userRoleRepo.find).toHaveBeenCalledWith({
				relations: ['user', 'role', 'grantedBy'],
			})
		})
	})

	describe('findPermissionsByUserId', () => {
		it('should return user-specific permissions', async () => {
			const userId = 42
			const perms = [{ id: 1, user: {}, role: {}, createdAt: new Date(), updatedAt: new Date() } as UserRole]
			userRoleRepo.find.mockResolvedValue(perms)

			const result = await service.findPermissionsByUserId(userId)
			expect(result).toEqual(perms)
			expect(userRoleRepo.find).toHaveBeenCalledWith({
				where: { user: { id: userId } },
				relations: ['role', 'grantedBy'],
			})
		})
	})
})
