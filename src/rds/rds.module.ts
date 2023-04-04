import { Module } from '@nestjs/common';
import { RdsService } from './rds.service';

@Module({
  providers: [RdsService],
  exports: [RdsService],
})
export class RdsModule {}