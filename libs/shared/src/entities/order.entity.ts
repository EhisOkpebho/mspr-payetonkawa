import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @ManyToOne(() => Customer, customer => customer.orders)
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ type: 'number' })
    customerId: number;

    @CreateDateColumn()
    createdAt: Date;
}
