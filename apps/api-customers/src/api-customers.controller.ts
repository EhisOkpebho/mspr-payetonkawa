import { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@app/shared/types/dto/customer.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiCustomersService } from './api-customers.service'

@Controller('customers')
export class ApiCustomersController {
	private readonly logger = new Logger(ApiCustomersController.name)

	constructor(private readonly customersService: ApiCustomersService) {}

	@Post()
	create(@Body() customer: CreateCustomerDTO): Promise<CustomerDTO> {
		this.logger.log('POST /customers')
		return this.customersService.create(customer)
	}

	@Put('/:id')
	update(@Param('id', ParseIntPipe) id: number, @Body() customer: UpdateCustomerDTO): Promise<CustomerDTO> {
		this.logger.log(`PUT /customers/${id}`)
		return this.customersService.update(id, customer)
	}

	@Delete('/:id')
	delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
		this.logger.log(`DELETE /customers/${id}`)
		return this.customersService.delete(id)
	}

	@Get()
	findAll(): Promise<CustomerDTO[]> {
		this.logger.log('GET /customers')
		return this.customersService.findAll()
	}

	@Get('/:id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<CustomerDTO> {
		this.logger.log(`GET /customers/${id}`)
		return this.customersService.findById(id)
	}
}
