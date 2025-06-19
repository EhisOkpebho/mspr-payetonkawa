import { Test, TestingModule } from '@nestjs/testing'
import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'
import { CreateUserRoleDto } from 'libs/shared/src/types/dto/user-role.dto'
import { User } from '@app/shared/entities/user.entity'

describe('RolesController', () => {
	let controller: RolesController

	const mockRolesService = {
		findAll: jest.fn(),
		createPermission: jest.fn(),
		deletePermission: jest.fn(),
		findPermissionsByUserId: jest.fn(),
		findPermissions: jest.fn(),
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RolesController],
			providers: [{ provide: RolesService, useValue: mockRolesService }],
		}).compile()

		controller = module.get<RolesController>(RolesController)
	})

	afterEach(() => jest.clearAllMocks())

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	describe('findAll', () => {
		it('should return all roles', async () => {
			const roles = [{ id: 1, name: 'admin' }]
			mockRolesService.findAll.mockResolvedValue(roles)

			expect(await controller.findAll()).toEqual(roles)
			expect(mockRolesService.findAll).toHaveBeenCalled()
		})
	})

	describe('createPermission', () => {
		it('should call service to create permission', async () => {
			const dto: CreateUserRoleDto = { userId: 1, roleId: 2 }
			const user = { id: 99 } as User
			const expected = { id: 123, userId: 1, roleId: 2 }

			mockRolesService.createPermission.mockResolvedValue(expected)

			expect(await controller.createPermission(dto, user)).toEqual(expected)
			expect(mockRolesService.createPermission).toHaveBeenCalledWith(dto, user)
		})
	})

	describe('deletePermission', () => {
		it('should call service to delete permission', async () => {
			mockRolesService.deletePermission.mockResolvedValue({ deleted: true })

			expect(await controller.deletePermission('5')).toEqual({ deleted: true })
			expect(mockRolesService.deletePermission).toHaveBeenCalledWith(5)
		})
	})

	describe('findPermissionsByUserId', () => {
		it('should return user permissions', async () => {
			const userId = 42
			const perms = [{ id: 1, role: { name: 'admin' } }]
			mockRolesService.findPermissionsByUserId.mockResolvedValue(perms)

			expect(await controller.findPermissionsByUserId(String(userId))).toEqual(perms)
			expect(mockRolesService.findPermissionsByUserId).toHaveBeenCalledWith(userId)
		})
	})

	describe('findPermissions', () => {
		it('should return all permissions', async () => {
			const perms = [{ id: 1, role: { name: 'user' }, user: { id: 1 } }]
			mockRolesService.findPermissions.mockResolvedValue(perms)

			expect(await controller.findPermissions()).toEqual(perms)
			expect(mockRolesService.findPermissions).toHaveBeenCalled()
		})
	})
})
