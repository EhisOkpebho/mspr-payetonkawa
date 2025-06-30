import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ValueTransformer } from 'typeorm'

const numericTransformer: ValueTransformer = {
	to: (value: number) => value,
	from: (value: string) => parseFloat(value),
}

@Entity()
export class Product {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ type: 'varchar', length: 255 })
	name: string

	@Column({
		type: 'numeric',
		precision: 10,
		scale: 2,
		default: 0,
		transformer: numericTransformer,
	})
	price: number

	@Column({ type: 'varchar', length: 255 })
	description: string

	@Column({ type: 'varchar', length: 255 })
	color: string

	@Column({ type: 'int', default: 0 })
	stock: number

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
