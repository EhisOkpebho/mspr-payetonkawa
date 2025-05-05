import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100 })
    username: string;

    @Column({ length: 100 })
    firstName: string;

    @Column({ length: 100 })
    lastName: string;

    @Column('jsonb')
    address: { postalCode: string; city: string };

    @Column('jsonb')
    profile: { firstName: string; lastName: string };

    @Column('jsonb')
    company: { companyName: string };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
