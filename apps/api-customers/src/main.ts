import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, RmqStatus, Transport } from '@nestjs/microservices'
import * as cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import { ApiCustomersModule } from './api-customers.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(ApiCustomersModule)
	app.use(cookieParser())
	app.enableCors()

	const server = app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL],
			queue: process.env.RABBITMQ_CUSTOMERS_QUEUE,
			queueOptions: {
				durable: false,
			},
		},
	})

	server.status.subscribe((status: RmqStatus) => {
		console.log(`Microservice with queue ${process.env.RABBITMQ_CUSTOMERS_QUEUE} is ${status} to RabbitMQ`)
	})

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	)

	await app.startAllMicroservices()
	await app.enableShutdownHooks()
	await app.listen(process.env.MS_API_CUSTOMERS_PORT || 3000, '0.0.0.0')
}

bootstrap()
