import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UserMiddleware implements NestMiddleware {
	private readonly logger = new Logger(UserMiddleware.name)

	constructor(private readonly jwtService: JwtService) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const token = this.extractTokenFromCookie(req)
		if (!token) {
			this.logger.debug('No token found in cookies')
			return next()
		}

		try {
			const { user } = await this.jwtService.verifyAsync(token)

			if (user) {
				const roles = user.roles || []
				this.logger.debug(`Decoded user with email ${user.email} and roles [${roles.join(', ')}]`)
				;(req as any).user = user
			}
		} catch (error) {
			this.logger.debug('Invalid or expired token', { error })
		}

		next()
	}

	private extractTokenFromCookie(request: Request): string | null {
		const rawAT = request.cookies ? request.cookies['access_token'] : null
		return rawAT ? rawAT.replace('Bearer ', '') : null
	}
}
