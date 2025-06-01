import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const host: HttpArgumentsHost = context.switchToHttp()
		if (!host.getRequest()['user']) {
			throw new ForbiddenException('You must be authenticated to access this resource')
		}
		return true
	}
}
