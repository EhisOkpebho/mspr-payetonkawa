import { Module } from '@nestjs/common'
import { ApiClientsController } from './api-clients.controller'
import { ApiClientsService } from './api-clients.service'
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		})
	],
	controllers: [ApiClientsController],
	providers: [ApiClientsService],
})
export class ApiClientsModule {}
