import { ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common/interfaces'
import { RolesGuard } from './roles.guard'

describe('RolesGuard', () => {
	let guard: RolesGuard
	let reflector: Reflector

	const mockExecutionContext = (userRoles: string[] = []) => {
		const getRequest = () => ({ user: { roles: userRoles } })
		return {
			switchToHttp: () => ({ getRequest }),
			getHandler: jest.fn(),
			getClass: jest.fn(),
			getType: jest.fn().mockResolvedValue('http'),
		} as unknown as ExecutionContext
	}

	beforeEach(() => {
		reflector = new Reflector()
		guard = new RolesGuard(reflector)
	})

	it('should allow access if no roles are required', () => {
		const context = mockExecutionContext()
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

		expect(guard.canActivate(context)).toBe(true)
	})

	it('should allow access if user has required role', () => {
		const context = mockExecutionContext(['admin'])
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin'])

		expect(guard.canActivate(context)).toBe(true)
	})

	it('should deny access if user lacks required role', () => {
		const context = mockExecutionContext(['user'])
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin'])

		expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
	})

	it('should deny access if user is missing', () => {
		const context = {
			switchToHttp: () => ({ getRequest: () => ({}) }),
			getHandler: jest.fn(),
			getClass: jest.fn(),
			getType: jest.fn().mockResolvedValue('http'),
		} as unknown as ExecutionContext

		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin'])

		expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
	})
})
