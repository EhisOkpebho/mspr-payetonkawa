import {Product} from "@app/shared/entities/product.entity";
import { Module } from '@nestjs/common'
import { ApiProductsController } from './api-products.controller'
import { ApiProductsService } from './api-products.service'
import { ConfigModule } from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5435,
			username: 'user',
			password: 'password',
			database: 'postgres',
			entities: [Product],
			autoLoadEntities: true,
			synchronize: true,
		}),
		TypeOrmModule.forFeature([Product])
	],
	controllers: [ApiProductsController],
	providers: [ApiProductsService],
})
export class ApiProductsModule {}
