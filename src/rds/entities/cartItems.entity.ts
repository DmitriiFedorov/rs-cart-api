import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class CartItems {
  @PrimaryColumn({ type: 'uuid' })
  cartId: string;

  @PrimaryColumn({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int4', nullable: true })
  count: number;
}
