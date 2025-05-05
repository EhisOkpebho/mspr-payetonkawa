import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto, FindOrderByIdDto, UpdateOrderDto } from '@app/shared/types/dto/order.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class ApiOrdersService {
	constructor(
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>
	) {}

	async getOrders(): Promise<Order[]> {
		return this.orderRepository.find()
	}

	async getOrderById({ id }: FindOrderByIdDto): Promise<Order> {
		return this.orderRepository.findOne({ where: { id } })
	}

	async createOrder(order: CreateOrderDto): Promise<Order> {
		return this.orderRepository.save(order)
	}

	async updateOrder({ id }: FindOrderByIdDto, order: UpdateOrderDto): Promise<Order> {
		await this.orderRepository.update(id, order)
		return this.orderRepository.findOne({ where: { id } })
	}

	async deleteOrder({ id }: FindOrderByIdDto): Promise<boolean> {
		const res = await this.orderRepository.delete(id)
		return res.affected > 0
	}
}
