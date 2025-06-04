import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from '@app/shared/entities/user.entity'

@Entity()
export class Customer {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column()
	name: string

	@Column()
	username: string

	@Column()
	firstName: string

	@Column()
	lastName: string

	@Column()
	postalCode: string

	@Column()
	city: string

	@Column()
	companyName: string

	@OneToOne(() => User, (user) => user.customer)
	user: User

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
