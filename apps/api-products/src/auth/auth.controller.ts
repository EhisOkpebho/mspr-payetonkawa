import { User } from '@app/shared/entities/user.entity'
import { Body, Controller, Logger, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name)

	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async signUp(@Body('email') email: string, @Body('password') password: string): Promise<User> {
		this.logger.log(`POST /auth/login`)
		return this.authService.signUp(email, password)
	}

	@Post('login')
	async signIn(@Body('email') email: string, @Body('password') password: string): Promise<User> {
		this.logger.log(`POST /auth/register`)
		return this.authService.signIn(email, password)
	}
}
