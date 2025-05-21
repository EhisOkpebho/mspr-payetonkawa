import { Order } from '@app/shared/entities/order.entity'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				url: config.get<string>('ORDERS_DB_URL'),
				entities: [Order],
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
		TypeOrmModule.forFeature([Order]),
	],
	controllers: [ApiOrdersController],
	providers: [ApiOrdersService],
})
export class ApiOrdersModule {}
