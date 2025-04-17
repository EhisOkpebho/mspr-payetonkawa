import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column('jsonb')
    details: {
        price: string;
        description: string;
        color: string;
    };

    @Column({ type: 'number' })
    stock: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
