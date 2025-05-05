import { Order } from '@app/shared/entities/order.entity'
import { Module } from '@nestjs/common'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

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
			entities: [Order],
			autoLoadEntities: true,
			synchronize: true,
		}),
		TypeOrmModule.forFeature([Order]),
	],
	controllers: [ApiOrdersController],
	providers: [ApiOrdersService],
})
export class ApiOrdersModule {}
