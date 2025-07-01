import { RolesGuard } from '@app/shared/_guards/roles.guard'
import { Product } from '@app/shared/entities/product.entity'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserMiddleware } from 'apps/api-products/src/_middlewares/user.middleware'
import { ApiProductsController } from './api-products.controller'
import { ApiProductsService } from './api-products.service'
import { PrometheusModule } from '@willsoto/nestjs-prometheus'
import {MetricsModule} from "@app/shared/metrics/metrics.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				url: config.get<string>('PRODUCTS_DB_URL'),
				entities: [Product],
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
		TypeOrmModule.forFeature([Product]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_ACCESS_SECRET'),
				signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m' },
			}),
		}),
		MetricsModule,
	],
	controllers: [ApiProductsController],
	providers: [ApiProductsService, { provide: 'APP_GUARD', useClass: RolesGuard }],
})
export class ApiProductsModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
