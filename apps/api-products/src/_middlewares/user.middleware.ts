import { User } from '@app/shared/entities/user.entity'
import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class UserMiddleware implements NestMiddleware {
	private readonly logger = new Logger(UserMiddleware.name)

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const trustKeyHeader = req.headers['ms_trust_key'] as string
		const trustId = req.headers['ms_trust_id'] as string
		const configTrustKey = this.configService.get<string>(`MS_${(trustId + '').toUpperCase()}_TRUST_KEY`)

		if (trustKeyHeader && configTrustKey && trustKeyHeader === configTrustKey && trustId) {
			this.logger.debug(`Found trust key (${trustKeyHeader})  and ID (${trustId}) in headers`)
			const now = new Date()
			const placeholderUser: User = {
				id: 0,
				email: trustId,
				password: '',
				customer: null,
				createdAt: now,
				updatedAt: now,
				roles: [trustId],
			}

			this.logger.debug(`Allowed microservice with trust id: ${trustId}`)
			;(req as any).user = placeholderUser
			return next()
		}

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
