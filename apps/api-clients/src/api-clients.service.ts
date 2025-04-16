import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiClientsService {
  getHello(): string {
    return 'Hello World!';
  }
}
