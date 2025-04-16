import { Test, TestingModule } from '@nestjs/testing';
import { ApiClientsController } from './api-clients.controller';
import { ApiClientsService } from './api-clients.service';

describe('ApiClientsController', () => {
  let apiClientsController: ApiClientsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiClientsController],
      providers: [ApiClientsService],
    }).compile();

    apiClientsController = app.get<ApiClientsController>(ApiClientsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(apiClientsController.getHello()).toBe('Hello World!');
    });
  });
});
