import { User } from '@app/shared/entities/user.entity'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
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

		return await this.userRepository.save(newUser)
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
		const saltRounds = 10
		return await bcrypt.hash(password, saltRounds)
	}

	async comparePassword(password: string, hash: string): Promise<boolean> {
		return await bcrypt.compare(password, hash)
	}

	generateToken(user: User): string {
		const payload = { email: user.email, sub: user.id }
		return this.jwtService.sign(payload)
	}

	generateRefreshToken(user: User): string {
		const payload = { email: user.email, sub: user.id }
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
