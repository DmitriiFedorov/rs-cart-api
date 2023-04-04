import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  Post,
  HttpStatus,
} from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import { AppRequest, getUserIdFromRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { ProductsService } from './services/product.service';
import { assembleCart } from './utils';
import { OrderService } from 'src/order';
import { CartStatus } from 'src/rds/types';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private productService: ProductsService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const cartResponse = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );
    const cartItems = await this.cartService.findCartItems(cartResponse.id);
    const productIds = cartItems.map(({ product_id }) => product_id);
    const products = await this.productService.getProductsByIds(productIds);
    const cart = assembleCart({ cartResponse, cartItems, products });

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { cart, total: calculateCartTotal(cart) },
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) {
    // TODO: validate body payload...
    await this.cartService.updateCartItemByUserId(
      getUserIdFromRequest(req),
      body,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete()
  clearUserCart(@Req() req: AppRequest) {
    this.cartService.removeByUserId(getUserIdFromRequest(req));

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put('checkout')
  async checkout(
    @Req() req: AppRequest,
    @Body()
    body: any,
  ) {
    const {
      items,
      address: {
        comment = '',
        address = '',
        firstName = '',
        lastName = '',
      } = {},
    } = body;
    // TODO: service uses hardcoded userId until users table is implemented
    const testUserId = '411e8b87-6417-413b-bb04-06c77cb24ee5';
    const cartResponse = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );
    const productIds = items.map(({ productId }) => productId);
    const cartItems = items.map(({ count, productId }) => ({
      count,
      product_id: productId,
    }));
    const products = await this.productService.getProductsByIds(productIds);
    const cart = assembleCart({
      cartResponse,
      cartItems,
      products,
    });

    await this.orderService.create({
      userId: testUserId,
      cartId: cartResponse.id,
      comments: comment,
      total: calculateCartTotal(cart),
      payment: JSON.stringify({ type: 'UPFRONT' }),
      delivery: JSON.stringify({
        address,
        firstName,
        lastName,
      }),
    });

    await this.cartService.updateCartStatus(
      cartResponse.id,
      CartStatus.Ordered,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }
}
