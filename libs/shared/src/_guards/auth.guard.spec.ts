import { AuthGuard } from './auth.guard'
import { ExecutionContext, ForbiddenException } from '@nestjs/common'

describe('AuthGuard', () => {
	let guard: AuthGuard
	let mockContext: ExecutionContext

	beforeEach(() => {
		guard = new AuthGuard()
		mockContext = {
			switchToHttp: jest.fn(),
		} as unknown as ExecutionContext
	})

	it('should allow access if user is authenticated', () => {
		const mockRequest = { user: { id: 1, name: 'John' } }

		const mockHttp = {
			getRequest: jest.fn().mockReturnValue(mockRequest),
		}

		jest.spyOn(mockContext, 'switchToHttp').mockReturnValue(mockHttp as any)

		expect(guard.canActivate(mockContext)).toBe(true)
	})

	it('should throw ForbiddenException if user is not authenticated', () => {
		const mockRequest = {}

		const mockHttp = {
			getRequest: jest.fn().mockReturnValue(mockRequest),
		}

		jest.spyOn(mockContext, 'switchToHttp').mockReturnValue(mockHttp as any)

		expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException)
	})
})
