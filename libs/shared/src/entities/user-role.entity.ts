import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { Role } from './role.entity'

@Entity('user_roles')
export class UserRole {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'user_id' })
	user: User

	@ManyToOne(() => Role, { nullable: false })
	@JoinColumn({ name: 'role_id' })
	role: Role

	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: 'granted_by' })
	grantedBy?: User | null

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
