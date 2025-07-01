import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { AuthGuard } from '@app/shared/_guards/auth.guard'
import { Order } from '@app/shared/entities/order.entity'
import { User } from '@app/shared/entities/user.entity'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { Body, Controller, Get, Logger, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { ApiOrdersService } from './api-orders.service'

import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Histogram } from 'prom-client'

@UseGuards(AuthGuard)
@Controller('orders')
export class ApiOrdersController {
	private readonly logger = new Logger(ApiOrdersController.name)

	constructor(
		private readonly ordersService: ApiOrdersService,
		@InjectMetric('HTTP_REQUEST_DURATION_SECONDS')
		private readonly requestDuration: Histogram<'method' | 'route' | 'status'>,
	) {}

	@Roles('admin', 'distributor', 'customer')
	@Post()
	async create(@Body() order: CreateOrderDto, @ReqUser() user: User): Promise<Order> {
		this.logger.log('POST /orders')
		const end = this.requestDuration.startTimer({ method: 'POST', route: '/orders' })
		try {
			const result = await this.ordersService.create({ ...order, customerId: user.customer ? user.customer.id : null })
			end({ status: '201' })
			return result
		} catch (e) {
			end({ status: '500' })
			throw e
		}
	}

	@Roles('admin', 'distributor', 'customer')
	@Get('me')
	findMyOrders(@ReqUser() user: User): Promise<Order[]> {
		this.logger.log(`GET /orders/me for user ${user.id}`)
		return this.ordersService.findByCustomerId(user.customer ? user.customer.id : null)
	}

	@Roles('admin', 'manager')
	@Get()
	async findAll(): Promise<Order[]> {
		this.logger.log('GET /orders')
		const end = this.requestDuration.startTimer({ method: 'GET', route: '/orders' })
		try {
			const result = await this.ordersService.findAll()
			end({ status: '200' })
			return result
		} catch (e) {
			end({ status: '500' })
			throw e
		}
	}

	@Roles('admin', 'manager')
	@Get('/:id')
	async findById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
		this.logger.log(`GET /orders/${id}`)
		const end = this.requestDuration.startTimer({ method: 'GET', route: '/orders/:id' })
		try {
			const result = await this.ordersService.findById(id)
			end({ status: '200' })
			return result
		} catch (e) {
			end({ status: '404' })
			throw e
		}
	}
}
