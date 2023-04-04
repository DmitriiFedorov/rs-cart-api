import { Injectable } from '@nestjs/common';

import { Cart } from '../models';
import { RdsService } from 'src/rds/rds.service';
import { CartStatus } from 'src/rds/types';

@Injectable()
export class CartService {
  constructor(private rdsService: RdsService) {}

  private userCarts: Record<string, Cart> = {};

  private getCurrentDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  async findByUserId(userId: string) {
    // TODO: service uses hardcoded userId until users table is implemented
    const testUserId = '411e8b87-6417-413b-bb04-06c77cb24ee5';
    const response = await this.rdsService.query(
      'SELECT * FROM carts WHERE user_id = $1 AND status = $2',
      [userId ?? testUserId, 'OPEN'],
    );

    return response;
  }

  async createByUserId(userId: string) {
    const result = await this.rdsService.query(
      'INSERT INTO carts (user_id, created_at, updated_at, status) VALUES ($1, $2, $3, $4)',
      [
        userId,
        this.getCurrentDateString(),
        this.getCurrentDateString(),
        'OPEN',
      ],
    );

    return result;
  }

  async findCartItems(cartId: string) {
    const items = await this.rdsService.query(
      'SELECT * FROM cart_items WHERE cart_id = $1',
      [cartId],
    );

    return items;
  }

  async findOrCreateByUserId(userId: string) {
    const [userCart] = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    // TODO: service uses hardcoded userId until users table is implemented
    const testUserId = '411e8b87-6417-413b-bb04-06c77cb24ee5';
    return await this.createByUserId(testUserId);
  }

  async updateCartItemByUserId(userId: string, payload: any) {
    // TODO: service uses hardcoded userId until users table is implemented
    const testUserId = '411e8b87-6417-413b-bb04-06c77cb24ee5';
    const [cart] = await this.findByUserId(userId ?? testUserId);

    if (!cart) {
      throw Error('No cart found!');
    }

    const cartItems = await this.findCartItems(cart.id);
    const updatedCartItem = cartItems.find(
      item => item.product_id === payload.product.id,
    );

    if (!updatedCartItem) {
      await this.rdsService.query(
        'INSERT INTO cart_items (cart_id, product_id, count) VALUES ($1, $2, $3)',
        [cart.id, payload.product.id, payload.count],
      );
      return;
    }

    if (payload.count === 0) {
      await this.rdsService.query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cart.id, updatedCartItem.product_id],
      );
      return;
    }

    await this.rdsService.query(
      'UPDATE cart_items SET count = $1 WHERE cart_id = $2 AND product_id = $3',
      [payload.count, cart.id, updatedCartItem.product_id],
    );
  }

  removeByUserId(userId): void {
    this.userCarts[userId] = null;
  }

  async updateCartStatus(cartId: string, status: CartStatus) {
    await this.rdsService.query(
      'UPDATE carts SET status = $1 WHERE id = $2',
      [status, cartId],
    );
  }
}
