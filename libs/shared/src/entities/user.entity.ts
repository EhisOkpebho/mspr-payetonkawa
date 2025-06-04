import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Customer } from '@app/shared/entities/customer.entity'

@Entity()
export class User {
	@PrimaryGeneratedColumn('identity')
	id: number

	@Column({ unique: true })
	email: string

	@Column()
	password: string

	@OneToOne(() => Customer, (customer) => customer.user, {
		cascade: true,
		eager: true,
		nullable: true,
	})
	@JoinColumn()
	customer: Customer

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date

	roles?: string[]
}
