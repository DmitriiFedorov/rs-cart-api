import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OrderStatus } from '../types';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  cartId: string;

  @Column({ type: 'json', nullable: true })
  payment: string;

  @Column({ type: 'json', nullable: true })
  delivery: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Open,
    nullable: false,
  })
  status: OrderStatus;

  @Column({ type: 'int4', nullable: false })
  total: number;
}
