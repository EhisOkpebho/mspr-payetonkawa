import { Module } from '@nestjs/common';
import { ApiClientsController } from './api-clients.controller';
import { ApiClientsService } from './api-clients.service';

@Module({
  imports: [],
  controllers: [ApiClientsController],
  providers: [ApiClientsService],
})
export class ApiClientsModule {}
