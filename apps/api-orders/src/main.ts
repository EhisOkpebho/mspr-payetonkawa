import { NestFactory } from '@nestjs/core';
import { ApiOrdersModule } from './api-orders.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiOrdersModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
