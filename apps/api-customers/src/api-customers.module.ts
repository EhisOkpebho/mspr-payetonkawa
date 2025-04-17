import { Module } from '@nestjs/common'
import { ApiCustomersController } from './api-customers.controller'
import { ApiCustomersService } from './api-customers.service'
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
			port: 5433,
			username: 'user',
			password: 'password',
			database: 'postgres',
			autoLoadEntities: true,
			synchronize: true,
		}),
	],
	controllers: [ApiCustomersController],
	providers: [ApiCustomersService],
})
export class ApiCustomersModule {}
