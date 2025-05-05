import { CreateOrderDto, UpdateOrderDto } from '@app/shared/types/dto/order.dto'
import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common'
import { ApiOrdersService } from './api-orders.service'

@Controller('orders')
export class ApiOrdersController {
	private readonly logger = new Logger(ApiOrdersController.name)

	constructor(private readonly ordersService: ApiOrdersService) {}

	@Get()
	getOrders() {
		this.logger.log('GET /orders')
		return this.ordersService.getOrders()
	}

	@Get('/:id')
	getOrderById(@Param('id') id: string) {
		this.logger.log(`GET /orders/${id}`)
		return this.ordersService.getOrderById({ id: parseInt(id) })
	}

	@Post()
	createOrder(@Body() order: CreateOrderDto) {
		this.logger.log('POST /orders')
		return this.ordersService.createOrder(order)
	}

	@Put('/:id')
	updateOrder(@Param('id') id: string, @Body() order: UpdateOrderDto) {
		this.logger.log(`PUT /orders/${id}`)
		return this.ordersService.updateOrder({ id: parseInt(id) }, order)
	}

	@Delete('/:id')
	deleteOrder(@Param('id') id: string) {
		this.logger.log(`DELETE /orders/${id}`)
		return this.ordersService.deleteOrder({ id: parseInt(id) })
	}
}
