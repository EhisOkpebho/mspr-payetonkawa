import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import * as dotenv from 'dotenv'
import { ApiCustomersModule } from './api-customers.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(ApiCustomersModule)

	await app.listen(3000)

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL],
			// queue: 'api_clients_queue',
			queue: 'default',
			queueOptions: {
				durable: false,
			},
		},
	})

	await app.startAllMicroservices()
}

bootstrap()
