import { User } from '@app/shared/entities/user.entity'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_ACCESS_SECRET'),
				signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m' },
			}),
		}),
	],
	providers: [AuthService],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
