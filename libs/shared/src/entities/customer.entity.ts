import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

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

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
