import { User } from '@app/shared/entities/user.entity'
import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AuthService } from 'apps/api-products/src/auth/auth.service'
import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'
import { RolesService } from '../roles/roles.service'

@Injectable()
export class UserMiddleware implements NestMiddleware {
	logger = new Logger(UserMiddleware.name)

	constructor(
		@Inject(AuthService)
		private readonly authService: AuthService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@Inject(RolesService)
		private readonly rolesService: RolesService,
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const token = this.extractTokenFromCookie(req)
		if (!token) {
			return next()
		}

		try {
			const { sub: userId } = await this.authService.verifyToken(token)
			const user = await this.userRepository.findOne({ where: { id: userId } })

			if (user) {
				const userRoles = await this.rolesService.findPermissions()
				const roles = userRoles.filter((ur) => ur.user.id === user.id).map((ur) => ur.role.name)
				;(user as any).roles = roles
				this.logger.debug(`Decoded user with email ${user.email} and roles [${roles.join(', ')}]`)
				;(req as any).user = user
			}
		} catch (error) {
			this.logger.debug('Invalid or expired token', { error })
		}

		next()
	}

	private extractTokenFromCookie(request: Request): string | null {
		const rawAT = request.cookies['access_token']
		return rawAT ? rawAT.replace('Bearer ', '') : null
	}
}
