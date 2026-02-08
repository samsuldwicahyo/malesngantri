import { Module } from '@nestjs/common';
import { BarbershopsService } from './barbershops.service';
import { BarbershopsController } from './barbershops.controller';

@Module({
  providers: [BarbershopsService],
  controllers: [BarbershopsController],
  exports: [BarbershopsService],
})
export class BarbershopsModule {}
