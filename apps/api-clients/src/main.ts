import { NestFactory } from '@nestjs/core';
import { ApiClientsModule } from './api-clients.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiClientsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
