import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CriterioAplicacionEntity,
  CriterioEntity,
  CriterioVersionEntity,
  EstandarEntity,
} from './entities';

const estandarEntities = [
  EstandarEntity,
  CriterioEntity,
  CriterioVersionEntity,
  CriterioAplicacionEntity,
];

@Module({
  imports: [TypeOrmModule.forFeature(estandarEntities)],
  exports: [TypeOrmModule],
})
export class EstandarModule {}
