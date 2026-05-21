import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriterioAplicacionEntity } from '../estandar/entities/criterio-aplicacion.entity';
import { PlanVisitasDetalleEntity } from '../planificacion/entities/plan-visitas-detalle.entity';
import { ServicioHabilitadoEntity } from '../prestador/entities/servicio-habilitado.entity';
import { AuthModule } from '../auth/auth.module';
import { ComplejidadController } from './complejidad.controller';
import { ComplejidadService } from './complejidad.service';
import { DepartamentoController } from './departamento.controller';
import { DepartamentoService } from './departamento.service';
import { EspecificidadServicioController } from './especificidad-servicio.controller';
import { EspecificidadServicioService } from './especificidad-servicio.service';
import {
  ComplejidadEntity,
  DepartamentoEntity,
  EspecificidadServicioEntity,
  GrupoServicioEntity,
  ModalidadServicioEntity,
  MunicipioEntity,
  ServicioCatalogoEntity,
} from './entities';
import { GrupoServicioController } from './grupo-servicio.controller';
import { GrupoServicioService } from './grupo-servicio.service';
import { ModalidadServicioController } from './modalidad-servicio.controller';
import { ModalidadServicioService } from './modalidad-servicio.service';
import { MunicipioController } from './municipio.controller';
import { MunicipioService } from './municipio.service';
import { ServicioCatalogoController } from './servicio-catalogo.controller';
import { ServicioCatalogoService } from './servicio-catalogo.service';

const catalogoEntities = [
  DepartamentoEntity,
  MunicipioEntity,
  GrupoServicioEntity,
  ServicioCatalogoEntity,
  ModalidadServicioEntity,
  ComplejidadEntity,
  EspecificidadServicioEntity,
  ServicioHabilitadoEntity,
  CriterioAplicacionEntity,
  PlanVisitasDetalleEntity,
];

@Module({
  imports: [TypeOrmModule.forFeature(catalogoEntities), AuthModule],
  controllers: [
    DepartamentoController,
    MunicipioController,
    GrupoServicioController,
    ServicioCatalogoController,
    ModalidadServicioController,
    ComplejidadController,
    EspecificidadServicioController,
  ],
  providers: [
    DepartamentoService,
    MunicipioService,
    GrupoServicioService,
    ServicioCatalogoService,
    ModalidadServicioService,
    ComplejidadService,
    EspecificidadServicioService,
  ],
  exports: [TypeOrmModule],
})
export class CatalogoModule {}
