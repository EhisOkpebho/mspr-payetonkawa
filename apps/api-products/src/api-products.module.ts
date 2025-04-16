import { Module } from '@nestjs/common'
import { ApiProductsController } from './api-products.controller'
import { ApiProductsService } from './api-products.service'
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		})
	],
	controllers: [ApiProductsController],
	providers: [ApiProductsService],
})
export class ApiProductsModule {}
