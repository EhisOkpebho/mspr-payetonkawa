import { ROLES_KEY } from '@app/shared/_decorators/roles.decorator'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const type = context.getType<'http' | 'rpc'>()
		if (type === 'rpc') {
			return true
		}

		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
		if (!requiredRoles || requiredRoles.length === 0) {
			return true
		}

		const { user } = context.switchToHttp().getRequest()
		const userRoles: string[] = user?.roles || []
		const hasRole = requiredRoles.some((role) => userRoles.includes(role))

		if (!hasRole) {
			throw new ForbiddenException('Access denied: insufficient permissions')
		}
		return true
	}
}
