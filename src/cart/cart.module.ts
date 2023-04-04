import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { RdsModule } from 'src/rds/rds.module';
import { ProductsService } from './services/product.service';
import { OrderService } from 'src/order';

@Module({
  imports: [OrderModule, RdsModule],
  providers: [CartService, ProductsService, OrderService],
  controllers: [CartController],
})
export class CartModule {}
