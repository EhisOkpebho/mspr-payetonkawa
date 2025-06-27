import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ConfigService } from '@nestjs/config'
import { User } from '@app/shared/entities/user.entity'
import { Response, Request } from 'express'

describe('AuthController', () => {
	let controller: AuthController
	let authService: AuthService
	let mockResponse: Partial<Response>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						signUp: jest.fn(),
						signIn: jest.fn(),
						refreshToken: jest.fn(),
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key: string) => {
							const config = {
								JWT_ACCESS_EXPIRATION: '15m',
								JWT_REFRESH_EXPIRATION: '30d',
								NODE_ENV: 'development',
							}
							return config[key]
						}),
					},
				},
			],
		}).compile()

		controller = module.get<AuthController>(AuthController)
		authService = module.get<AuthService>(AuthService)

		mockResponse = {
			cookie: jest.fn(),
			clearCookie: jest.fn(),
			json: jest.fn(),
			status: jest.fn().mockReturnThis(),
		}
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	describe('signUp', () => {
		it('should call authService.signUp and return user', async () => {
			const user = { id: 1, email: 'john.doe@ecoles-epsi.net' } as User
			jest.spyOn(authService, 'signUp').mockResolvedValue(user)

			const result = await controller.signUp('john.doe@ecoles-epsi.net', 'password123')

			expect(authService.signUp).toHaveBeenCalledWith('john.doe@ecoles-epsi.net', 'password123')
			expect(result).toBe(user)
		})
	})

	describe('signIn', () => {
		it('should set cookies and return user', async () => {
			const user = { id: 1, email: 'john.doe@ecoles-epsi.net' } as User
			const tokens = {
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
				user,
			}

			jest.spyOn(authService, 'signIn').mockResolvedValue(tokens)

			const res = mockResponse as Response
			const result = await controller.signIn('john.doe@ecoles-epsi.net', 'password123', res)

			expect(authService.signIn).toHaveBeenCalledWith('john.doe@ecoles-epsi.net', 'password123')
			expect(res.cookie).toHaveBeenCalledTimes(2)
			expect(res.json).toHaveBeenCalledWith(user)
			expect(result).toBeUndefined()
		})
	})

	describe('logout', () => {
		it('should clear cookies and return OK response', () => {
			const res = mockResponse as Response
			controller.logout(res)

			expect(res.clearCookie).toHaveBeenCalledWith('access_token')
			expect(res.clearCookie).toHaveBeenCalledWith('refresh_token')
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' })
		})
	})

	describe('refreshToken', () => {
		it('should return 400 if no refresh_token cookie is found', async () => {
			const req = { cookies: {} } as Request
			const res = mockResponse as Response

			await controller.refreshToken(req, res)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token is missing' })
		})

		it('should refresh tokens and set new cookies', async () => {
			const req = {
				cookies: {
					refresh_token: 'Bearer old-token',
				},
			} as unknown as Request
			const res = mockResponse as Response

			const tokens = {
				accessToken: 'new-access',
				refreshToken: 'new-refresh',
			}

			jest.spyOn(authService, 'refreshToken').mockResolvedValue(tokens)

			await controller.refreshToken(req, res)

			expect(authService.refreshToken).toHaveBeenCalledWith('Bearer old-token')
			expect(res.cookie).toHaveBeenCalledTimes(2)
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ message: 'Token refreshed successfully' })
		})
	})

	describe('getMe', () => {
		it('should return the user from decorator', async () => {
			const user = { id: 1, email: 'me@example.com' } as User
			const result = await controller.getMe(user)
			expect(result).toBe(user)
		})
	})
})
