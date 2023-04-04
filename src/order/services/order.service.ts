import { Injectable } from '@nestjs/common';

import { RdsService } from 'src/rds/rds.service';

import { Order } from '../models';

@Injectable()
export class OrderService {
  private orders: Record<string, Order> = {};

  constructor(private rdsService: RdsService) {}

  private mergeOrderRecords = (ordersRecords: any[]) => {
    return ordersRecords.reduce((acc, { id, product_id, count, ...rest }) => {
      const orderInAcc = acc.find(item => item.id === id);

      if (!orderInAcc) {
        acc.push({ id, ...rest, items: [{ product_id, count }] });
      } else {
        orderInAcc.items.push({ product_id, count });
      }

      return acc;
    }, []);
  };

  async getOrders() {
    const ordersRecords = await this.rdsService.query(
      `SELECT * FROM orders
       JOIN cart_items
       ON orders.cart_id = cart_items.cart_id`,
    );

    const mergedOrderRecords = this.mergeOrderRecords(ordersRecords);

    const response = mergedOrderRecords.map(
      ({ delivery, comments, id, items }) => {
        return {
          address: {
            address: delivery.address,
            firstName: delivery.firstName,
            lastName: delivery.lastName,
            comment: comments,
          },
          id,
          statusHistory: [
            { status: 'OPEN', timestamp: Date.now(), comment: 'Order opened' },
          ],
          items,
        };
      },
    );

    return response;
  }

  async findById(orderId: string) {
    const orderRecords = await this.rdsService.query(
      'SELECT * FROM orders JOIN cart_items ON orders.cart_id = cart_items.cart_id WHERE id = $1',
      [orderId],
    );

    const [mergedRecord] = this.mergeOrderRecords(orderRecords);

    const response = {
      id: mergedRecord.id,
      address: {
        address: mergedRecord.delivery.address,
        firstName: mergedRecord.delivery.firstName,
        lastName: mergedRecord.delivery.lastName,
        comment: mergedRecord.comments,
      },
      items: mergedRecord.items,
      statusHistory: [
        { status: 'OPEN', timestamp: Date.now(), comment: 'Order opened' },
      ],
    };

    return response;
  }

  async create(data: {
    userId: string;
    cartId: string;
    payment: string;
    delivery: string;
    comments: string;
    total: number;
  }) {
    const { userId, cartId, payment, delivery, comments, total } = data;

    await this.rdsService.query(
      'INSERT INTO orders(user_id, cart_id, payment, delivery, comments, total, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userId, cartId, payment, delivery, comments, total, 'OPEN'],
    );
  }

  async updateStatus(
    orderId: string,
    data: { comment: string; status: string },
  ) {
    await this.rdsService.query('UPDATE orders SET comments = $1, status = $2 WHERE id = $3', [data.comment, data.status, orderId]);
  }

  async deleteById(id: string) {
    await this.rdsService.query('DELETE FROM orders WHERE id = $1', [id]); 
  }
}
