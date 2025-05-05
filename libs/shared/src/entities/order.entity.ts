import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ type: 'int' })
    customerId: number;

    @CreateDateColumn()
    createdAt: Date;
}
