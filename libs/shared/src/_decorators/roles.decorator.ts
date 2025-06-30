import { SetMetadata } from '@nestjs/common'

export type RoleType = 'admin' | 'customer' | 'distributor' | 'manager' | 'sysops' | 'api_customers' | 'api_orders' | 'api_products'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles)
