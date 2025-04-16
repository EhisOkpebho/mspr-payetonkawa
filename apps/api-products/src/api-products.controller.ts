import { Controller, Get } from '@nestjs/common'
import { ApiProductsService } from './api-products.service'

@Controller()
export class ApiProductsController {
	constructor(private readonly apiProductsService: ApiProductsService) {}

	@Get()
	getHello(): string {
		return this.apiProductsService.getHello()
	}
}
