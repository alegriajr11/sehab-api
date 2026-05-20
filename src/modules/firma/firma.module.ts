import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmaDigitalEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([FirmaDigitalEntity])],
  exports: [TypeOrmModule],
})
export class FirmaModule {}
