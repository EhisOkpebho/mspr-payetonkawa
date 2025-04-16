import { Controller, Get } from '@nestjs/common'
import { ApiClientsService } from './api-clients.service'

@Controller()
export class ApiClientsController {
	constructor(private readonly apiClientsService: ApiClientsService) {}

	@Get()
	getHello(): string {
		return this.apiClientsService.getHello()
	}
}
