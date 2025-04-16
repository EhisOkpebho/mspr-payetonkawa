import { Test, TestingModule } from '@nestjs/testing'
import { ApiOrdersController } from './api-orders.controller'
import { ApiOrdersService } from './api-orders.service'

describe('ApiOrdersController', () => {
	let apiOrdersController: ApiOrdersController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [ApiOrdersController],
			providers: [ApiOrdersService],
		}).compile()

		apiOrdersController = app.get<ApiOrdersController>(ApiOrdersController)
	})

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(apiOrdersController.getHello()).toBe('Hello World!')
		})
	})
})
