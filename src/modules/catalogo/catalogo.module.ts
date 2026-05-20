import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ComplejidadEntity,
  DepartamentoEntity,
  EspecificidadServicioEntity,
  GrupoServicioEntity,
  ModalidadServicioEntity,
  MunicipioEntity,
  ServicioCatalogoEntity,
} from './entities';

const catalogoEntities = [
  DepartamentoEntity,
  MunicipioEntity,
  GrupoServicioEntity,
  ServicioCatalogoEntity,
  ModalidadServicioEntity,
  ComplejidadEntity,
  EspecificidadServicioEntity,
];

@Module({
  imports: [TypeOrmModule.forFeature(catalogoEntities)],
  exports: [TypeOrmModule],
})
export class CatalogoModule {}
