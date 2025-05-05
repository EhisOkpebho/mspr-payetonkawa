import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ApiOrdersModule } from './api-orders.module'

async function bootstrap() {
	const app = await NestFactory.create(ApiOrdersModule)

	await app.listen(3001)

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: ['amqp://admin:admin@127.0.0.2:5672'],
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
