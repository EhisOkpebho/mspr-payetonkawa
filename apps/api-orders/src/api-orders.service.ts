import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiOrdersService {
  getHello(): string {
    return 'Hello World!';
  }
}
