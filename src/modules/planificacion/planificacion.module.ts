import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanVisitasDetalleEntity, PlanVisitasEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanVisitasEntity, PlanVisitasDetalleEntity]),
  ],
  exports: [TypeOrmModule],
})
export class PlanificacionModule {}
