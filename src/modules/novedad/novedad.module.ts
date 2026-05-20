import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovedadEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([NovedadEntity])],
  exports: [TypeOrmModule],
})
export class NovedadModule {}
