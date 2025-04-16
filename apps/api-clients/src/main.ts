import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ApiClientsModule } from './api-clients.module'

async function bootstrap() {
	const app = await NestFactory.create(ApiClientsModule);

	await app.listen(3000);

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: ['amqp://admin:admin@127.0.0.2:5672'],
			queue: 'api_clients_queue',
			queueOptions: {
				durable: false,
			},
		},
	});

	await app.startAllMicroservices();
}
bootstrap()
