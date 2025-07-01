import { RolesGuard } from '@app/shared/_guards/roles.guard'
import { Customer } from '@app/shared/entities/customer.entity'
import { Role } from '@app/shared/entities/role.entity'
import { UserRole } from '@app/shared/entities/user-role.entity'
import { User } from '@app/shared/entities/user.entity'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserMiddleware } from './_middlewares/user.middleware'
import { ApiCustomersController } from './api-customers.controller'
import { ApiCustomersService } from './api-customers.service'
import { AuthModule } from './auth/auth.module'
import { AuthService } from './auth/auth.service'
import { RolesModule } from './roles/roles.module'
import { RolesService } from './roles/roles.service'
import { MetricsModule } from '@app/shared/metrics/metrics.module'

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
		MetricsModule,
	],
	controllers: [ApiCustomersController],
	providers: [ApiCustomersService, AuthService, RolesService, { provide: 'APP_GUARD', useClass: RolesGuard }, ],
})
export class ApiCustomersModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
