import { Customer } from '@app/shared/entities/customer.entity'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiCustomersController } from './api-customers.controller'
import { ApiCustomersService } from './api-customers.service'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				url: config.get<string>('CUSTOMERS_DB_URL'),
				entities: [Customer],
				autoLoadEntities: true,
				synchronize: true,
				dropSchema: true,
			}),
		}),
		TypeOrmModule.forFeature([Customer]),
	],
	controllers: [ApiCustomersController],
	providers: [ApiCustomersService],
})
export class ApiCustomersModule {}
