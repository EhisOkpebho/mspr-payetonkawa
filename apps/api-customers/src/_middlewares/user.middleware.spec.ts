import { UserMiddleware } from './user.middleware'
import { AuthService } from '../auth/auth.service'
import { RolesService } from '../roles/roles.service'
import { User } from '@app/shared/entities/user.entity'
import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'

describe('UserMiddleware', () => {
	let middleware: UserMiddleware
	let authService: Partial<AuthService>
	let rolesService: Partial<RolesService>
	let userRepository: Partial<Repository<User>>
	let req: Partial<Request>
	let res: Partial<Response>
	let next: NextFunction

	beforeEach(() => {
		authService = {
			verifyToken: jest.fn(),
		}

		rolesService = {
			findPermissions: jest.fn(),
		}

		userRepository = {
			findOne: jest.fn(),
		}

		middleware = new UserMiddleware(authService as AuthService, userRepository as Repository<User>, rolesService as RolesService)

		req = {
			cookies: {},
		}
		res = {}
		next = jest.fn()
	})

	it('should call next if no token is present', async () => {
		req.cookies = {}
		await middleware.use(req as Request, res as Response, next)
		expect(next).toHaveBeenCalled()
	})

	it('should call next if verifyToken throws error', async () => {
		req.cookies = { access_token: 'Bearer invalidtoken' }
		;(authService.verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'))

		await middleware.use(req as Request, res as Response, next)

		expect(authService.verifyToken).toHaveBeenCalledWith('invalidtoken')
		expect(next).toHaveBeenCalled()
	})

	it('should attach user with roles if token is valid', async () => {
		const mockUser = { id: 1, email: 'test@test.com' } as User
		const mockPermissions = [
			{ user: { id: 1 }, role: { name: 'admin' } },
			{ user: { id: 2 }, role: { name: 'user' } },
		]

		req.cookies = { access_token: 'Bearer validtoken' }
		;(authService.verifyToken as jest.Mock).mockResolvedValue({ sub: 1 })
		;(userRepository.findOne as jest.Mock).mockResolvedValue(mockUser)
		;(rolesService.findPermissions as jest.Mock).mockResolvedValue(mockPermissions)

		const typedReq = req as Request & { user?: any }

		await middleware.use(typedReq, res as Response, next)

		expect(authService.verifyToken).toHaveBeenCalledWith('validtoken')
		expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
		expect(rolesService.findPermissions).toHaveBeenCalled()
		expect(typedReq.user).toEqual(expect.objectContaining({ id: 1, email: 'test@test.com', roles: ['admin'] }))
		expect(next).toHaveBeenCalled()
	})
})
