import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CartStatus } from '../types';

@Entity()
export class Carts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'date', nullable: false })
  createdAt: string;

  @Column({ type: 'date', nullable: false })
  updatedAt: string;

  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.Open, nullable: true })
  status: CartStatus;
}
