import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { User } from '@app/shared/entities/user.entity'
import { Repository } from 'typeorm'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { RolesService } from '../roles/roles.service'
import * as bcrypt from 'bcrypt'

describe('AuthService', () => {
	let service: AuthService
	let userRepository: jest.Mocked<Repository<User>>
	let rolesService: RolesService
	let jwtService: JwtService
	let configService: ConfigService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(User),
					useValue: {
						findOne: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
					},
				},
				{
					provide: RolesService,
					useValue: {
						findPermissions: jest.fn(),
					},
				},
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn().mockReturnValue('signed-token'),
						verifyAsync: jest.fn(),
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key) => {
							const map = {
								JWT_REFRESH_SECRET: 'refresh-secret',
								JWT_REFRESH_EXPIRATION: '30d',
							}
							return map[key]
						}),
					},
				},
			],
		}).compile()

		service = module.get(AuthService)
		userRepository = module.get(getRepositoryToken(User))
		rolesService = module.get(RolesService)
		jwtService = module.get(JwtService)
		configService = module.get(ConfigService)
	})

	describe('signUp', () => {
		it('should throw if email already exists', async () => {
			userRepository.findOne.mockResolvedValue({ email: 'test@example.com' } as User)

			await expect(service.signUp('test@example.com', 'pass')).rejects.toThrow(ConflictException)
		})

		it('should create and return new user', async () => {
			userRepository.findOne.mockResolvedValue(null)
			userRepository.create.mockImplementation((data) => data as User)
			userRepository.save.mockResolvedValue({ id: 1, email: 'new@example.com' } as User)

			const result = await service.signUp('new@example.com', 'password')

			expect(result).toEqual(expect.objectContaining({ email: 'new@example.com', roles: [] }))
		})
	})

	describe('signIn', () => {
		it('should throw if user not found', async () => {
			userRepository.findOne.mockResolvedValue(null)

			await expect(service.signIn('none@example.com', 'pass')).rejects.toThrow(UnauthorizedException)
		})

		it('should throw if password invalid', async () => {
			userRepository.findOne.mockResolvedValue({ id: 1, email: 'a', password: 'hashed' } as User)
			rolesService.findPermissions = jest.fn().mockResolvedValue([{ user: { id: 1 }, role: { name: 'admin' } }])
			jest.spyOn(service, 'comparePassword').mockResolvedValue(false)

			await expect(service.signIn('a', 'wrong')).rejects.toThrow(UnauthorizedException)
		})

		it('should return tokens and user if valid credentials', async () => {
			const mockUser = { id: 1, email: 'user', password: 'hash' } as User
			userRepository.findOne.mockResolvedValue(mockUser)
			rolesService.findPermissions = jest.fn().mockResolvedValue([{ user: { id: 1 }, role: { name: 'admin' } }])
			jest.spyOn(service, 'comparePassword').mockResolvedValue(true)

			const result = await service.signIn('user', 'valid')

			expect(result).toEqual({
				user: expect.objectContaining({ id: 1, roles: ['admin'] }),
				accessToken: 'signed-token',
				refreshToken: 'signed-token',
			})
		})

		it('should throw UnauthorizedException when password is incorrect', async () => {
			const user = { id: 1, email: 'test@example.com', password: 'hashed-password' } as User

			userRepository.findOne.mockResolvedValue(user)
			rolesService.findPermissions = jest.fn().mockResolvedValue([]) // pas pertinent ici
			jest.spyOn(service, 'comparePassword').mockResolvedValue(false)

			await expect(service.signIn('test@example.com', 'wrong-password')).rejects.toThrow(
				new UnauthorizedException('Invalid credentials'),
			)
		})

	})

	describe('refreshToken', () => {
		it('should return new tokens', async () => {
			const mockDecoded = { sub: 1 }
			const mockUser = { id: 1, email: 'a' } as User

			jwtService.verifyAsync = jest.fn().mockResolvedValue(mockDecoded)
			userRepository.findOne.mockResolvedValue(mockUser)

			const result = await service.refreshToken('Bearer token')

			expect(result).toEqual({
				accessToken: 'signed-token',
				refreshToken: 'signed-token',
			})
		})
	})

	describe('hashPassword & comparePassword', () => {
		it('should hash password', async () => {
			const hash = await service.hashPassword('password123')
			expect(typeof hash).toBe('string')
			expect(hash).not.toBe('password123')
		})

		it('should compare passwords correctly', async () => {
			const password = 'mypassword'
			const hash = await bcrypt.hash(password, 10)
			const isMatch = await service.comparePassword(password, hash)
			expect(isMatch).toBe(true)
		})
	})

	describe('generateToken & generateRefreshToken', () => {
		it('should sign a token with user payload', () => {
			const token = service.generateToken({ id: 1 } as User)
			expect(token).toBe('signed-token')
		})

		it('should sign a refresh token with secret and expiration', () => {
			const token = service.generateRefreshToken({ id: 1 } as User)
			expect(token).toBe('signed-token')
		})
	})

	describe('verifyToken', () => {
		it('should verify and return decoded payload', async () => {
			jwtService.verifyAsync = jest.fn().mockResolvedValue({ sub: 1 })
			const result = await service.verifyToken('token')
			expect(result).toEqual({ sub: 1 })
		})

		it('should throw if invalid token', async () => {
			jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('invalid'))
			await expect(service.verifyToken('bad')).rejects.toThrow(UnauthorizedException)
		})
	})
})
