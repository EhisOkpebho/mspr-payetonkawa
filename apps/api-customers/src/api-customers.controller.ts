import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { AuthGuard } from '@app/shared/_guards/auth.guard'
import { User } from '@app/shared/entities/user.entity'
import { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@app/shared/types/dto/customer.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { ApiCustomersService } from './api-customers.service'

@UseGuards(AuthGuard)
@Controller('customers')
export class ApiCustomersController {
	private readonly logger = new Logger(ApiCustomersController.name)

	constructor(private readonly customersService: ApiCustomersService) {}

	@Post()
	create(@Body() customer: CreateCustomerDTO, @ReqUser() user: User): Promise<CustomerDTO> {
		this.logger.log('POST /customers')
		return this.customersService.create(customer, user)
	}

	@Roles('admin', 'customer')
	@Put('/:id')
	update(@Param('id', ParseIntPipe) id: number, @Body() customer: UpdateCustomerDTO, @ReqUser() user: User): Promise<CustomerDTO> {
		this.logger.log(`PUT /customers/${id}`)
		return this.customersService.update(id, customer, user)
	}

	@Roles('admin', 'customer')
	@Delete('/:id')
	delete(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<boolean> {
		this.logger.log(`DELETE /customers/${id}`)
		return this.customersService.delete(id, user)
	}

	@Roles('admin')
	@Get()
	findAll(): Promise<CustomerDTO[]> {
		this.logger.log('GET /customers')
		return this.customersService.findAll()
	}

	@Roles('admin')
	@Get('/:id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<CustomerDTO> {
		this.logger.log(`GET /customers/${id}`)
		return this.customersService.findById(id)
	}
}
