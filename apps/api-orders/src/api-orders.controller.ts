import { Controller, Get } from '@nestjs/common';
import { ApiOrdersService } from './api-orders.service';

@Controller()
export class ApiOrdersController {
  constructor(private readonly apiOrdersService: ApiOrdersService) {}

  @Get()
  getHello(): string {
    return this.apiOrdersService.getHello();
  }
}
