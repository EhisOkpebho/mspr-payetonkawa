import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiProductsService {
  getHello(): string {
    return 'Hello World!';
  }
}
