import {Order} from "@app/shared/entities/order.entity";
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ length: 100 })
    firstName: string;

    @Column({ length: 100 })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @OneToMany(() => Order, order => order.customer)
    orders: Order[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
