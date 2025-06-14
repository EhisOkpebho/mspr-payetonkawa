import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { Injectable, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthGuard } from './_guards/auth.guard'
import { Roles } from '@app/shared/_decorators/roles.decorator'

@UseGuards(AuthGuard)
@Injectable()
export class ApiOrdersService {
	constructor(
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>,
	) {}

	// TODO: use request user to set customer id in order

	@Roles()
	async create(order: CreateOrderDto): Promise<Order> {
		return this.orderRepository.save(order)
	}

	async findAll(): Promise<Order[]> {
		return this.orderRepository.find()
	}

	async findById(id: number): Promise<Order> {
		const order = await this.orderRepository.findOne({ where: { id } })
		if (!order) {
			throw new Error(`Order with id ${id} not found`)
		}
		return order
	}
}
