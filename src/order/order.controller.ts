import { Controller, Get, Put, Delete, Body, HttpStatus, Param } from '@nestjs/common';

import { OrderService } from './services';
import { CartService } from 'src/cart';
import { ProductsService } from 'src/cart/services/product.service';

@Controller('api/profile/order')
export class OrderController {
  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private productService: ProductsService,
  ) {}

  @Get()
  async getOrders() {
    const ordersRecords = await this.orderService.getOrders();

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: ordersRecords,
    };
  }

  @Put()
  async createOrder(@Body() body: any) {
    const {
      address: {
        address = '',
        firstName = '',
        lastName = '',
        comment = '',
      } = {},
    } = body;
    // TODO: implement logic to get a real user id when user service is ready
    const testUserId = '411e8b87-6417-413b-bb04-06c77cb24ee5';
    const [cart] = await this.cartService.findByUserId(testUserId);
    const cartItems = await this.cartService.findCartItems(cart.id);
    const productIds = cartItems.map(({ product_id }) => product_id);
    const products = await this.productService.getProductsByIds(productIds);
    const total = cartItems.reduce((acc, next) => {
      const product = products.find(({ id }) => id === next.product_id);
      return acc + (next?.count * product?.price ?? 0);
    }, 0);

    await this.orderService.create({
      userId: testUserId,
      cartId: cart.id,
      comments: comment,
      payment: JSON.stringify({ type: 'UPFRONT' }),
      delivery: JSON.stringify({
        address,
        firstName,
        lastName,
      }),
      total,
    });
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.findById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: order,
    };
  }

  @Put(':id/status')
  async updateOrderById(@Param('id') id: string, @Body() body: { comment: string, status: string }) {
    await this.orderService.updateStatus(id, body);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @Delete(':id')
  async deleteOrderById(@Param('id') id: string) {
    await this.orderService.deleteById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }
}
