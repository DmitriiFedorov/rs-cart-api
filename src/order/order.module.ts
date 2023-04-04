import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { OrderController } from './order.controller';
import { RdsService } from 'src/rds/rds.service';
import { CartService } from 'src/cart';
import { ProductsService } from 'src/cart/services/product.service';

@Module({
  providers: [OrderService, RdsService, CartService, ProductsService],
  exports: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
