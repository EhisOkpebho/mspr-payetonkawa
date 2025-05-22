import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto, UpdateOrderDto } from '@app/shared/types/dto/order.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class ApiOrdersService {
	constructor(
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>,
	) {}

	async create(order: CreateOrderDto): Promise<Order> {
		return this.orderRepository.save(order)
	}

	async update(id: number, order: UpdateOrderDto): Promise<Order> {
		await this.orderRepository.update(id, order)
		return this.orderRepository.findOne({ where: { id } })
	}

	async delete(id: number): Promise<boolean> {
		const res = await this.orderRepository.delete(id)
		return res.affected > 0
	}

	async findAll(): Promise<Order[]> {
		return this.orderRepository.find()
	}

	async findById(id: number): Promise<Order> {
		return this.orderRepository.findOne({ where: { id } })
	}
}
