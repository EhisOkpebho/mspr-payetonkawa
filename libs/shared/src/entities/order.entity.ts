import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Order {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'int' })
	customerId: number

	@Column({ type: 'int' })
	productId: number

	@Column({ type: 'int', default: 1 })
	quantity: number

	@CreateDateColumn()
	createdAt: Date
}
