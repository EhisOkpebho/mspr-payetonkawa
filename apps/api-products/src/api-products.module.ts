import { Module } from '@nestjs/common';
import { ApiProductsController } from './api-products.controller';
import { ApiProductsService } from './api-products.service';

@Module({
  imports: [],
  controllers: [ApiProductsController],
  providers: [ApiProductsService],
})
export class ApiProductsModule {}
