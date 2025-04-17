import { Module } from '@nestjs/common'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'
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
			port: 5434,
			username: 'user',
			password: 'password',
			database: 'postgres',
			autoLoadEntities: true,
			synchronize: true,
		}),
	],
	controllers: [ApiOrdersController],
	providers: [ApiOrdersService],
})
export class ApiOrdersModule {}
