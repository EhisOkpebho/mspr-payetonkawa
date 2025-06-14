import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import * as cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import { ApiProductsModule } from './api-products.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(ApiProductsModule)
	app.use(cookieParser())
	app.enableCors()

	await app.listen(3002)

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [process.env.RABBITMQ_URL],
			// queue: 'api_products_queue',
			queue: 'default',
			queueOptions: {
				durable: false,
			},
		},
	})

	await app.startAllMicroservices()
}

bootstrap()
