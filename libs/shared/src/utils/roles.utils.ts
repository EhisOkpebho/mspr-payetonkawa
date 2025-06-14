import { User } from '@app/shared/entities/user.entity'

export function hasRole(role: string, user: User): boolean {
	return user.roles.includes(role)
}
