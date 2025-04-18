import {Customer} from "@app/shared/entities/customer.entity";
import {CreateCustomerDto, FindCustomerByIdDto, UpdateCustomerDto} from "@app/shared/types/dto/customer.dto";
import { Injectable } from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class ApiCustomersService {
	constructor(
		@InjectRepository(Customer)
		private readonly customerRepository: Repository<Customer>
	) {}

	async getCustomers(): Promise<Customer[]> {
		return this.customerRepository.find()
	}

	async getCustomerById({ id }: FindCustomerByIdDto): Promise<Customer> {
		return this.customerRepository.findOne({ where: { id } })
	}

	async createCustomer(customer: CreateCustomerDto): Promise<Customer> {
		return this.customerRepository.save(customer)
	}

	async updateCustomer({ id }: FindCustomerByIdDto, customer: UpdateCustomerDto): Promise<Customer> {
		await this.customerRepository.update(id, customer)
		return this.customerRepository.findOne({ where: { id } })
	}

	async deleteCustomer({ id }: FindCustomerByIdDto): Promise<boolean> {
		const res =  await this.customerRepository.delete(id)
		return res.affected > 0
	}
}
