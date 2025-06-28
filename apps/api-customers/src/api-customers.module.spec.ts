import { Test, TestingModule } from '@nestjs/testing'
import { ApiCustomersModule } from './api-customers.module'
import { APP_GUARD } from '@nestjs/core'
import { UserMiddleware } from './_middlewares/user.middleware'
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { RolesGuard } from '@app/shared/_guards/roles.guard'

describe('ApiCustomersModule', () => {
	let moduleRef: TestingModule
	let apiModule: ApiCustomersModule

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [ApiCustomersModule],
			providers: [
				{
					provide: APP_GUARD,
					useClass: RolesGuard,
				},
			],
		}).compile()

		apiModule = moduleRef.get(ApiCustomersModule, { strict: false })
	})

	it('should be defined', () => {
		expect(apiModule).toBeDefined()
	})

	it('should apply UserMiddleware for all routes', () => {
		const applyMock = jest.fn().mockReturnThis()
		const forRoutesMock = jest.fn()

		const mockConsumer = {
			apply: applyMock,
			forRoutes: forRoutesMock,
		} as unknown as MiddlewareConsumer

		const module = new ApiCustomersModule()
		module.configure(mockConsumer)

		expect(applyMock).toHaveBeenCalledWith(UserMiddleware)
		expect(forRoutesMock).toHaveBeenCalledWith({ path: '*', method: RequestMethod.ALL })
	})
})
