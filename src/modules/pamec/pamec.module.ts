import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadCriterioEntity, ActividadEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([ActividadEntity, ActividadCriterioEntity])],
  exports: [TypeOrmModule],
})
export class PamecModule {}
