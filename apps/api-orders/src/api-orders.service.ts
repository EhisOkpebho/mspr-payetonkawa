import { Roles } from '@app/shared/_decorators/roles.decorator'
import { Order } from '@app/shared/entities/order.entity'
import { CreateOrderDto } from '@app/shared/types/dto/order.dto'
import { Inject, Injectable, NotFoundException, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { lastValueFrom } from 'rxjs'
import { Repository } from 'typeorm'
import { AuthGuard } from './_guards/auth.guard'

@UseGuards(AuthGuard)
@Injectable()
export class ApiOrdersService {
	constructor(
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>,
		@Inject('PRODUCTS_SERVICE')
		private readonly productsClient: ClientProxy,
	) {}

	// url rabbitmq pur accéder à la version web
	// http://localhost:15672

	// TODO: Check with API call if product is in stock and right quantity

	@Roles()
	async create(dto: CreateOrderDto): Promise<Order> {
		const order = await this.orderRepository.save(dto)
		await lastValueFrom(this.productsClient.emit('order.created', { order }))
		return order
	}

	async findAll(): Promise<Order[]> {
		return this.orderRepository.find()
	}

	async findById(id: number): Promise<Order> {
		const order = await this.orderRepository.findOne({ where: { id } })
		if (!order) {
			throw new NotFoundException(`Order with id ${id} not found`)
		}
		return order
	}
}
