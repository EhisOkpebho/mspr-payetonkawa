import { Controller, Get } from '@nestjs/common'
import { ApiCustomersService } from './api-customers.service'

@Controller()
export class ApiCustomersController {
	constructor(private readonly ApiCustomersService: ApiCustomersService) {}

	@Get()
	getHello(): string {
		return this.ApiCustomersService.getHello()
	}
}
