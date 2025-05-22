import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto, UpdateOrderDto } from '@app/shared/types/dto/order.dto'
import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiOrdersService } from './api-orders.service'

@Controller('orders')
export class ApiOrdersController {
	private readonly logger = new Logger(ApiOrdersController.name)

	constructor(private readonly ordersService: ApiOrdersService) {}

	@Post()
	create(@Body() order: CreateOrderDto): Promise<Order> {
		this.logger.log('POST /orders')
		return this.ordersService.create(order)
	}

	@Put('/:id')
	update(@Param('id', ParseIntPipe) id: number, @Body() order: UpdateOrderDto): Promise<Order> {
		this.logger.log(`PUT /orders/${id}`)
		return this.ordersService.update(id, order)
	}

	@Delete('/:id')
	delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
		this.logger.log(`DELETE /orders/${id}`)
		return this.ordersService.delete(id)
	}

	@Get()
	findAll(): Promise<Order[]> {
		this.logger.log('GET /orders')
		return this.ordersService.findAll()
	}

	@Get('/:id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
		this.logger.log(`GET /orders/${id}`)
		return this.ordersService.findById(id)
	}
}
