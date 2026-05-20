import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActaFirmaEntity,
  ActaVisitaEntity,
  AutoevaluacionEntity,
  AutoevaluacionItemEntity,
  VisitaEntity,
  VisitaParticipanteEntity,
  VisitaResultadoItemEntity,
} from './entities';

const evaluacionEntities = [
  AutoevaluacionEntity,
  AutoevaluacionItemEntity,
  VisitaEntity,
  VisitaParticipanteEntity,
  ActaVisitaEntity,
  ActaFirmaEntity,
  VisitaResultadoItemEntity,
];

@Module({
  imports: [TypeOrmModule.forFeature(evaluacionEntities)],
  exports: [TypeOrmModule],
})
export class EvaluacionModule {}
