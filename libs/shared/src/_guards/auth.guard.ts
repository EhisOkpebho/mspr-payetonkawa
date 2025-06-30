import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const type = context.getType<'http' | 'rpc'>()

		if (type === 'rpc') {
			return true
		}

		const req = context.switchToHttp().getRequest()

		if (!req.user) {
			throw new ForbiddenException('You must be authenticated to access this resource')
		}

		return true
	}
}
