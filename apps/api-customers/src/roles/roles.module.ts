import { Module } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RolesController } from './roles.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@app/shared/entities/user.entity'
import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'

@Module({
	imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
	providers: [RolesService],
	controllers: [RolesController],
	exports: [RolesService],
})
export class RolesModule {}
