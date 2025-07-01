import { Roles } from '@app/shared/_decorators/roles.decorator'
import { ReqUser } from '@app/shared/_decorators/user.decorator'
import { AuthGuard } from '@app/shared/_guards/auth.guard'
import { Order } from '@app/shared/entities/order.entity'
import { User } from '@app/shared/entities/user.entity'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { Body, Controller, Get, Logger, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { ApiOrdersService } from './api-orders.service'

@UseGuards(AuthGuard)
@Controller('orders')
export class ApiOrdersController {
	private readonly logger = new Logger(ApiOrdersController.name)

	constructor(private readonly ordersService: ApiOrdersService) {}

	@Roles('admin', 'distributor', 'customer')
	@Post()
	create(@Body() order: CreateOrderDto, @ReqUser() user: User): Promise<Order> {
		this.logger.log('POST /orders')
		return this.ordersService.create({ ...order, customerId: user.customer ? user.customer.id : null })
	}

	@Roles('admin', 'distributor', 'customer')
	@Get('me')
	findMyOrders(@ReqUser() user: User): Promise<Order[]> {
		this.logger.log(`GET /orders/me for user ${user.id}`)
		return this.ordersService.findByCustomerId(user.customer ? user.customer.id : null)
	}

	@Roles('admin', 'manager')
	@Get()
	findAll(): Promise<Order[]> {
		this.logger.log('GET /orders')
		return this.ordersService.findAll()
	}

	@Roles('admin', 'manager')
	@Get('/:id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
		this.logger.log(`GET /orders/${id}`)
		return this.ordersService.findById(id)
	}
}
