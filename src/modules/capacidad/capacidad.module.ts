import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CapacidadInstaladaEntity,
  CapacidadMovimientoEntity,
  CapacidadTipoEntity,
} from './entities';

const capacidadEntities = [
  CapacidadTipoEntity,
  CapacidadInstaladaEntity,
  CapacidadMovimientoEntity,
];

@Module({
  imports: [TypeOrmModule.forFeature(capacidadEntities)],
  exports: [TypeOrmModule],
})
export class CapacidadModule {}
