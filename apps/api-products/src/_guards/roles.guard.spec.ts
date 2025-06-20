import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'

describe('RolesGuard', () => {
	let guard: RolesGuard
	let reflector: Partial<Reflector>

	beforeEach(() => {
		reflector = {
			getAllAndOverride: jest.fn(),
		}
		guard = new RolesGuard(reflector as Reflector)
	})

	function createContext(userRoles?: string[]): ExecutionContext {
		return {
			switchToHttp: () => ({
				getRequest: () => ({ user: { roles: userRoles } }),
			}),
			switchToRpc: jest.fn(),
			switchToWs: jest.fn(),
			getArgByIndex: jest.fn(),
			getArgs: jest.fn(),
			getClass: jest.fn(),
			getHandler: jest.fn(),
			getType: jest.fn(),
			getNext: jest.fn(),
		} as unknown as ExecutionContext
	}

	it('should allow when no roles are required', () => {
		;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)
		const context = createContext(['user'])
		expect(guard.canActivate(context)).toBe(true)
	})

	it('should allow if user has at least one required role', () => {
		;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin', 'distributor'])
		const context = createContext(['manager', 'admin'])
		expect(guard.canActivate(context)).toBe(true)
	})

	it('should throw ForbiddenException if user lacks required roles', () => {
		;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin'])
		const context = createContext(['manager'])
		expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
	})
})
