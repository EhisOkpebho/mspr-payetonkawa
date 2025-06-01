import { User } from '@app/shared/entities/user.entity'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { RolesService } from '../roles/roles.service'
import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role, UserRole]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_ACCESS_SECRET'),
				signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m' },
			}),
		}),
	],
	providers: [AuthService, RolesService],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
