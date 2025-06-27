import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, RmqStatus, Transport } from '@nestjs/microservices'
import * as cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import { ApiOrdersModule } from './api-orders.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(ApiOrdersModule)
	app.use(cookieParser())
	app.enableCors()

	const server = app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL],
			queue: process.env.RABBITMQ_ORDERS_QUEUE,
			queueOptions: {
				durable: false,
			},
		},
	})

	server.status.subscribe((status: RmqStatus) => {
		console.log(`Microservice with queue ${process.env.RABBITMQ_ORDERS_QUEUE} is ${status} to RabbitMQ`)
	})

	await app.startAllMicroservices()
	await app.listen(process.env.MS_API_ORDERS_PORT)
}

bootstrap()
