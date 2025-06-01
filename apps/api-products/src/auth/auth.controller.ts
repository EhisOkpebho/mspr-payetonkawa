import { User } from '@app/shared/entities/user.entity'
import { Body, Controller, Get, HttpStatus, Logger, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { ReqUser } from '../_decorators/user.decorator'
import { AuthGuard } from '../_guards/auth.guard'

@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name)

	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	private _setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
		const parse = (d: string) => {
			const [, v, u] = d.match(/^(\d+)([smhdy])$/) || []
			const n = parseInt(v || '0')
			const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, y: 31536000 }
			return u && units[u] ? n * units[u] * 1000 : 0
		}

		const rawAT = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m'
		const rawRT = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d'

		const maxAgeAT = parse(rawAT)
		const maxAgeRT = parse(rawRT)

		const isProd = this.configService.get<string>('NODE_ENV') === 'production'

		res.cookie('access_token', `Bearer ${accessToken}`, {
			httpOnly: true,
			secure: isProd,
			sameSite: 'strict',
			maxAge: maxAgeAT,
		})

		res.cookie('refresh_token', `Bearer ${refreshToken}`, {
			httpOnly: true,
			secure: isProd,
			sameSite: 'strict',
			maxAge: maxAgeRT,
		})
	}

	@Post('register')
	async signUp(@Body('email') email: string, @Body('password') password: string): Promise<User> {
		this.logger.log(`POST /auth/register`)
		return this.authService.signUp(email, password)
	}

	@Post('login')
	async signIn(@Body('email') email: string, @Body('password') password: string, @Res() res: Response) {
		this.logger.log(`POST /auth/login`)
		const { user, accessToken, refreshToken } = await this.authService.signIn(email, password)
		this._setAuthCookies(res, accessToken, refreshToken)
		res.json(user)
	}

	@Post('logout')
	logout(@Res() res: Response) {
		this.logger.log(`POST /auth/logout`)
		res.clearCookie('access_token')
		res.clearCookie('refresh_token')
		return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' })
	}

	@Post('refresh')
	async refreshToken(@Req() req: Request, @Res() res: Response) {
		this.logger.log(`POST /auth/refresh`)

		const rawRt = req.cookies?.['refresh_token']
		if (!rawRt) {
			this.logger.error('Refresh token is missing')
			return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Refresh token is missing' })
		}

		const { accessToken, refreshToken } = await this.authService.refreshToken(rawRt)

		this._setAuthCookies(res, accessToken, refreshToken)

		return res.status(HttpStatus.OK).json({ message: 'Token refreshed successfully' })
	}

	@UseGuards(AuthGuard)
	@Get('me')
	async getMe(@ReqUser() user: User): Promise<User> {
		this.logger.log(`GET /auth/me`)
		return user
	}
}
