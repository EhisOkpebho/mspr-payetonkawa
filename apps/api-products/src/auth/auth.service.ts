import { User } from '@app/shared/entities/user.entity'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async signUp(email: string, password: string): Promise<User> {
		const existingUser = await this.userRepository.findOne({ where: { email } })
		if (existingUser) {
			throw new Error('Email already in use')
		}

		const hashedPassword = await this.hashPassword(password)

		const newUser = this.userRepository.create({
			email,
			password: hashedPassword,
		})

		return await this.userRepository.save(newUser)
	}

	async signIn(email: string, password: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { email } })
		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const isPasswordValid = await this.comparePassword(password, user.password)
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials')
		}

		return user
	}

	async hashPassword(password: string): Promise<string> {
		const saltRounds = 10
		return await bcrypt.hash(password, saltRounds)
	}

	async comparePassword(password: string, hash: string): Promise<boolean> {
		return await bcrypt.compare(password, hash)
	}
}
