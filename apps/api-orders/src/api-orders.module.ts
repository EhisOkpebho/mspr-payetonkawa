import { RolesGuard } from '@app/shared/_guards/roles.guard'
import { Order } from '@app/shared/entities/order.entity'
import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserMiddleware } from './_middlewares/user.middleware'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'

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
		ConfigModule.forRoot({ isGlobal: true }),
		HttpModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				baseURL: config.get<string>('PRODUCTS_API_URL') || 'http://localhost:3002',
				timeout: 5000,
			}),
		}),
		ClientsModule.registerAsync([
			{
				name: 'PRODUCTS_SERVICE',
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: (config: ConfigService) => ({
					transport: Transport.RMQ,
					options: {
						urls: [config.get<string>('RABBITMQ_URL')],
						queue: config.get<string>('RABBITMQ_PRODUCTS_QUEUE'),
						queueOptions: { durable: false },
					},
				}),
			},
		]),
	],
	controllers: [ApiOrdersController],
	providers: [ApiOrdersService, { provide: 'APP_GUARD', useClass: RolesGuard }],
})
export class ApiOrdersModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
