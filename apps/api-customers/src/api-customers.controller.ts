import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { AuthGuard } from '@app/shared/_guards/auth.guard'
import { User } from '@app/shared/entities/user.entity'
import { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@app/shared/types/dto/customer.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { ApiCustomersService } from './api-customers.service'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Histogram } from 'prom-client'

@UseGuards(AuthGuard)
@Controller('customers')
export class ApiCustomersController {
	private readonly logger = new Logger(ApiCustomersController.name)

	constructor(
		private readonly customersService: ApiCustomersService,
		@InjectMetric('api_customers_request_duration_seconds')
		private readonly requestDurationHistogram: Histogram,
	) {}
	@Post()
	async create(@Body() customer: CreateCustomerDTO, @ReqUser() user: User): Promise<CustomerDTO> {
		const end = this.requestDurationHistogram.startTimer({ route: 'POST /customers' })
		const result = await this.customersService.create(customer, user)
		end()
		return result
	}

	@Put('/:id')
	async update(@Param('id', ParseIntPipe) id: number, @Body() customer: UpdateCustomerDTO, @ReqUser() user: User): Promise<CustomerDTO> {
		const end = this.requestDurationHistogram.startTimer({ route: 'PUT /customers/:id' })
		const result = await this.customersService.update(id, customer, user)
		end()
		return result
	}

	@Delete('/:id')
	async delete(@Param('id', ParseIntPipe) id: number, @ReqUser() user: User): Promise<boolean> {
		const end = this.requestDurationHistogram.startTimer({ route: 'DELETE /customers/:id' })
		const result = await this.customersService.delete(id, user)
		end()
		return result
	}

	@Roles('admin')
	@Get()
	async findAll(): Promise<CustomerDTO[]> {
		const end = this.requestDurationHistogram.startTimer({ route: 'GET /customers' })
		const result = await this.customersService.findAll()
		end()
		return result
	}

	@Roles('admin')
	@Get('/:id')
	async findById(@Param('id', ParseIntPipe) id: number): Promise<CustomerDTO> {
		const end = this.requestDurationHistogram.startTimer({ route: 'GET /customers/:id' })
		const result = await this.customersService.findById(id)
		end()
		return result
	}
}
