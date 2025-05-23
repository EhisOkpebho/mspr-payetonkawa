import { Customer } from '@app/shared/entities/customer.entity'
import { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@app/shared/types/dto/customer.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { toCustomerDTO, toCustomerEntity } from 'apps/api-customers/src/api-customers.mapper'
import { Repository } from 'typeorm'

@Injectable()
export class ApiCustomersService {
	constructor(
		@InjectRepository(Customer)
		private readonly customerRepository: Repository<Customer>,
	) {}

	async create(customer: CreateCustomerDTO): Promise<CustomerDTO> {
		const created = await this.customerRepository.save(toCustomerEntity(customer as unknown as CustomerDTO))
		return toCustomerDTO(created)
	}

	async update(id: number, customer: UpdateCustomerDTO): Promise<CustomerDTO> {
		await this.customerRepository.update(id, toCustomerEntity(customer as CustomerDTO))
		return toCustomerDTO(await this.customerRepository.findOne({ where: { id } }))
	}

	async delete(id: number): Promise<boolean> {
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
