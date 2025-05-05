import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ApiCustomersModule } from './api-customers.module'

async function bootstrap() {
	const app = await NestFactory.create(ApiCustomersModule);

	await app.listen(3000);

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: ['amqp://admin:admin@127.0.0.2:5672'],
			// queue: 'api_clients_queue',
			queue: 'default',
			queueOptions: {
				durable: false,
			},
		},
	});

	await app.startAllMicroservices();
}
bootstrap()
