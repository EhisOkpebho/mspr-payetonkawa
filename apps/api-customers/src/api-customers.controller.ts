import {CreateCustomerDto} from "@app/shared/types/dto/customer.dto";
import {Body, Controller, Delete, Get, Logger, Param, Post, Put} from '@nestjs/common'
import { ApiCustomersService } from './api-customers.service'

@Controller('customers')
export class ApiCustomersController {
	logger = new Logger(ApiCustomersController.name)

	constructor(private readonly customersService: ApiCustomersService) {}

	@Get()
	getCustomers() {
		this.logger.log('GET /customers')
		return this.customersService.getCustomers()
	}

	@Get('/:id')
	getCustomerById(@Param('id') id: string) {
		this.logger.log(`GET /customers/${id}`)
		return this.customersService.getCustomerById({ id: parseInt(id) })
	}

	@Post()
	createCustomer(@Body() customer: CreateCustomerDto) {
		this.logger.log('POST /customers')
		return this.customersService.createCustomer(customer)
	}

	@Put('/:id')
	updateCustomer(@Param('id') id: string, @Body() customer: CreateCustomerDto) {
		this.logger.log(`PUT /customers/${id}`)
		return this.customersService.updateCustomer({ id: parseInt(id) }, customer)
	}

	@Delete('/:id')
	deleteCustomer(@Param('id') id: string) {
		this.logger.log(`DELETE /customers/${id}`)
		return this.customersService.deleteCustomer({ id: parseInt(id) })
	}
}
