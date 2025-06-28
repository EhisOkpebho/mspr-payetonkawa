import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Product {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'varchar', length: 255 })
	name: string

	@Column({ type: 'int' })
	price: number

	@Column({ type: 'varchar', length: 255 })
	description: string

	@Column({ type: 'varchar', length: 255 })
	color: string

	@Column({ type: 'int' })
	stock: number

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
