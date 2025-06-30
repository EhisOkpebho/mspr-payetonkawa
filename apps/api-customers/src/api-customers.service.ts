import { Customer } from '@app/shared/entities/customer.entity'
import { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@app/shared/types/dto/customer.dto'
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '@app/shared/entities/user.entity'
import { hasRole } from '@app/shared/utils/roles.utils'
import { toCustomerDTO, toCustomerEntity } from './api-customers.mapper'

@Injectable()
export class ApiCustomersService {
	constructor(
		@InjectRepository(Customer)
		private readonly customerRepository: Repository<Customer>,
	) {}

	async create(customer: CreateCustomerDTO, user: User): Promise<CustomerDTO> {
		if (user.customer) {
			throw new ConflictException(`A customer profile is already linked to this user`)
		}
		const created = await this.customerRepository.save({
			...toCustomerEntity(customer as unknown as CustomerDTO),
			user,
		})
		return toCustomerDTO(created)
	}

	async update(id: number, customer: UpdateCustomerDTO, user: User): Promise<CustomerDTO> {
		if (!user.customer && !hasRole('admin', user)) {
			throw new NotFoundException(`No customer profile linked to this user`)
		}
		if (user.customer.id !== id && !hasRole('admin', user)) {
			throw new ForbiddenException('Not allowed to update this customer')
		}
		await this.findById(id)
		await this.customerRepository.update(id, toCustomerEntity(customer as CustomerDTO))
		return toCustomerDTO(await this.customerRepository.findOne({ where: { id } }))
	}

	async delete(id: number, user: User): Promise<boolean> {
		if (!user.customer) {
			throw new NotFoundException(`No customer profile linked to this user`)
		}
		if (user.customer.id !== id && !hasRole('admin', user)) {
			throw new ForbiddenException('Not allowed to delete this customer')
		}
		await this.findById(id)
		const res = await this.customerRepository.delete(id)
		return res.affected > 0
	}

	async findAll(): Promise<CustomerDTO[]> {
		const customers = await this.customerRepository.find()
		return customers.map(toCustomerDTO)
	}

	async findById(id: number): Promise<CustomerDTO> {
		const customer = await this.customerRepository.findOne({ where: { id } })
		if (!customer) {
			throw new NotFoundException(`Customer with id ${id} not found`)
		}
		return toCustomerDTO(customer)
	}
}
