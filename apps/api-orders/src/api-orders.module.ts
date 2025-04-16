import { Module } from '@nestjs/common'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		})
	],
	controllers: [ApiOrdersController],
	providers: [ApiOrdersService],
})
export class ApiOrdersModule {}
