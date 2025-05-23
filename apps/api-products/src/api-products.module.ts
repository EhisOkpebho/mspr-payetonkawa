import { Product } from '@app/shared/entities/product.entity'
import { User } from '@app/shared/entities/user.entity'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserMiddleware } from 'apps/api-products/src/_middlewares/user.middleware'
import { ApiProductsController } from './api-products.controller'
import { ApiProductsService } from './api-products.service'
import { AuthModule } from './auth/auth.module'
import { AuthService } from './auth/auth.service'

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
		TypeOrmModule.forFeature([User, Product]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_ACCESS_SECRET'),
				signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m' },
			}),
		}),
		AuthModule,
	],
	controllers: [ApiProductsController],
	providers: [ApiProductsService, AuthService],
})
export class ApiProductsModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
