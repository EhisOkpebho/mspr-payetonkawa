import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { AuthGuard } from 'libs/shared/src/_guards/auth.guard'

describe('AuthGuard', () => {
	let guard: AuthGuard

	beforeEach(() => {
		guard = new AuthGuard()
	})

	function createContext(user?: any): ExecutionContext {
		return {
			switchToHttp: () => ({
				getRequest: () => ({ user }),
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

	it('should return true when user is present', () => {
		const context = createContext({ id: 1 })
		expect(guard.canActivate(context)).toBe(true)
	})

	it('should throw ForbiddenException when user is absent', () => {
		const context = createContext()
		expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
	})
})
