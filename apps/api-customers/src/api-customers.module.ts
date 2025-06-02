import { Customer } from '@app/shared/entities/customer.entity'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiCustomersController } from './api-customers.controller'
import { ApiCustomersService } from './api-customers.service'
import { User } from '@app/shared/entities/user.entity'
import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth/auth.service'
import { AuthModule } from './auth/auth.module'
import { RolesModule } from './roles/roles.module'
import { RolesService } from './roles/roles.service'
import { RolesGuard } from './_guards/roles.guard'
import { UserMiddleware } from './_middlewares/user.middleware'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				url: config.get<string>('CUSTOMERS_DB_URL'),
				entities: [Customer],
				autoLoadEntities: true,
				synchronize: true,
				dropSchema: true,
			}),
		}),
		TypeOrmModule.forFeature([User, Role, UserRole, Customer]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_ACCESS_SECRET'),
				signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m' },
			}),
		}),
		AuthModule,
		RolesModule,
	],
	controllers: [ApiCustomersController],
	providers: [ApiCustomersService, AuthService, RolesService, { provide: 'APP_GUARD', useClass: RolesGuard }],
})
export class ApiCustomersModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
