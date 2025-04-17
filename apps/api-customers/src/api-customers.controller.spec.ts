import { Test, TestingModule } from '@nestjs/testing'
import { ApiCustomersController } from './api-customers.controller'
import { ApiCustomersService } from './api-customers.service'

describe('ApiCustomersController', () => {
	let ApiCustomersController: ApiCustomersController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [ApiCustomersController],
			providers: [ApiCustomersService],
		}).compile()

		ApiCustomersController = app.get<ApiCustomersController>(ApiCustomersController)
	})

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(ApiCustomersController.getHello()).toBe('Hello World!')
		})
	})
})
