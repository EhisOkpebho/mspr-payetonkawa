import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ApiProductsModule } from "./api-products.module";

async function bootstrap() {
	const app = await NestFactory.create(ApiProductsModule);

	await app.listen(3002);

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: ['amqp://admin:admin@127.0.0.2:5672'],
			// queue: 'api_products_queue',
			queue: 'default',
			queueOptions: {
				durable: false,
			},
		},
	});

	await app.startAllMicroservices();
}
bootstrap()
