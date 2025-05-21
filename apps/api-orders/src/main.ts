import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import * as dotenv from 'dotenv'
import { ApiOrdersModule } from './api-orders.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(ApiOrdersModule)

	await app.listen(3001)

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL],
			// queue: 'api_orders_queue',
			queue: 'default',
			queueOptions: {
				durable: false,
			},
		},
	})

	await app.startAllMicroservices()
}

bootstrap()
