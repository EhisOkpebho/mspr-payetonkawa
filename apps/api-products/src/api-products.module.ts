import { Product } from '@app/shared/entities/product.entity'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiProductsController } from './api-products.controller'
import { ApiProductsService } from './api-products.service'

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
	],
	controllers: [ApiProductsController],
	providers: [ApiProductsService],
})
export class ApiProductsModule {}
