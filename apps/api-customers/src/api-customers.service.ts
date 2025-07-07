import { Customer } from '@app/shared/entities/customer.entity'
import { User } from '@app/shared/entities/user.entity'
import { CreateCustomerDTO, CustomerDTO, UpdateCustomerDTO } from '@app/shared/types/dto/customer.dto'
import { hasRole } from '@app/shared/utils/roles.utils'
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { toCustomerDTO, toCustomerEntity } from './api-customers.mapper'
import { RolesService } from './roles/roles.service'

@Injectable()
export class ApiCustomersService {
	constructor(
		@InjectRepository(Customer)
		private readonly customerRepository: Repository<Customer>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly rolesService: RolesService,
	) {}

	async create(customer: CreateCustomerDTO, user: User): Promise<CustomerDTO> {
		if (user.customer) {
			throw new ConflictException(`A customer profile is already linked to this user`)
		}
		const created = await this.customerRepository.save({
			...toCustomerEntity(customer as unknown as CustomerDTO),
			user,
		})
		await this.rolesService.createPermission({ roleId: 'customer', userId: user.id })
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
		const customerWithUser = await this.customerRepository.findOne({
			where: { id },
			relations: ['user'],
		})

		if (customerWithUser && customerWithUser.user) {
			const userId = customerWithUser.user.id

			await this.userRepository.update(userId, { customer: null })

			const userPermissions = await this.rolesService.findPermissionsByUserId(userId)
			const customerPermission = userPermissions.find((permission) => permission.role.name === 'customer')

			if (customerPermission) {
				await this.rolesService.deletePermission(customerPermission.id)
			}
		}
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
