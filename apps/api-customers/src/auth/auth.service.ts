import { User } from '@app/shared/entities/user.entity'
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as argon2 from 'argon2'
import { Repository } from 'typeorm'
import { RolesService } from '../roles/roles.service'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@Inject(RolesService)
		private readonly rolesService: RolesService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	async signUp(email: string, password: string): Promise<User> {
		const existingUser = await this.userRepository.findOne({ where: { email } })
		if (existingUser) {
			throw new ConflictException('Email already in use')
		}

		const hashedPassword = await this.hashPassword(password)

		const newUser = this.userRepository.create({
			email,
			password: hashedPassword,
		})

		const user = await this.userRepository.save(newUser)
		return { ...user, roles: [] }
	}

	async signIn(
		email: string,
		password: string,
	): Promise<{
		user: User
		accessToken: string
		refreshToken: string
	}> {
		const user = await this.userRepository.findOne({ where: { email } })
		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const userRoles = await this.rolesService.findPermissions()
		user.roles = userRoles.filter((ur) => ur.user.id === user.id).map((ur) => ur.role.name)

		const isPasswordValid = await this.comparePassword(password, user.password)
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const access_token = this.generateToken(user)
		const refresh_token = this.generateRefreshToken(user)
		return { user, accessToken: access_token, refreshToken: refresh_token }
	}

	async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
		const decoded = await this.verifyToken(token.replace('Bearer ', ''), {
			secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
		})
		const user = await this.userRepository.findOne({ where: { id: decoded.sub } })

		return {
			accessToken: this.generateToken(user),
			refreshToken: this.generateRefreshToken(user),
		}
	}

	async hashPassword(password: string): Promise<string> {
		return await argon2.hash(password)
	}

	async comparePassword(password: string, hash: string): Promise<boolean> {
		try {
			return await argon2.verify(hash, password)
		} catch {
			return false
		}
	}

	generateToken(user: User): string {
		const payload = { user, sub: user.id }
		return this.jwtService.sign(payload)
	}

	generateRefreshToken(user: User): string {
		const payload = { user, sub: user.id }
		return this.jwtService.sign(payload, {
			secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d',
		})
	}

	async verifyToken(token: string, options?: JwtVerifyOptions): Promise<any> {
		try {
			return await this.jwtService.verifyAsync(token, options)
		} catch {
			throw new UnauthorizedException('Invalid token')
		}
	}
}
