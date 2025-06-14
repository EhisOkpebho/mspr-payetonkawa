import { SetMetadata } from '@nestjs/common'

export type RoleType = 'admin' | 'customer' | 'distributor' | 'manager' | 'sysops'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles)
