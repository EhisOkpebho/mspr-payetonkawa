import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, RmqStatus, Transport } from '@nestjs/microservices'
import * as cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import { ApiProductsModule } from './api-products.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(ApiProductsModule)
	app.use(cookieParser())
	app.enableCors()

	const server = app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL],
			queue: process.env.RABBITMQ_PRODUCTS_QUEUE,
			queueOptions: {
				durable: false,
			},
		},
	})

	server.status.subscribe((status: RmqStatus) => {
		console.log(`Microservice with queue ${process.env.RABBITMQ_PRODUCTS_QUEUE} is ${status} to RabbitMQ`)
	})

	await app.startAllMicroservices()
	await app.listen(process.env.MS_API_PRODUCTS_PORT)
}

bootstrap()
