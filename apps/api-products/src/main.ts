import { NestFactory } from '@nestjs/core';
import { ApiProductsModule } from './api-products.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiProductsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
