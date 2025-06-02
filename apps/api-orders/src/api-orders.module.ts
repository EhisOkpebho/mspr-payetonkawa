import { Order } from '@app/shared/entities/order.entity'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'
import { UserMiddleware } from './_middlewares/user.middleware'
import { JwtModule } from '@nestjs/jwt'
import { RolesGuard } from '../../api-customers/src/_guards/roles.guard'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				url: config.get<string>('ORDERS_DB_URL'),
				entities: [Order],
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_ACCESS_SECRET'),
				signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m' },
			}),
		}),
		TypeOrmModule.forFeature([Order]),
	],
	controllers: [ApiOrdersController],
	providers: [ApiOrdersService, { provide: 'APP_GUARD', useClass: RolesGuard }],
})
export class ApiOrdersModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
