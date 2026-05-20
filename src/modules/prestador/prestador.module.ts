import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PrestadorEntity,
  SedeEntity,
  ServicioHabilitadoEntity,
} from './entities';

const prestadorEntities = [
  PrestadorEntity,
  SedeEntity,
  ServicioHabilitadoEntity,
];

@Module({
  imports: [TypeOrmModule.forFeature(prestadorEntities)],
  exports: [TypeOrmModule],
})
export class PrestadorModule {}
