import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { CumpleEnum } from '../../../common/enums';
import { VisitaEntity } from './visita.entity';
import { ActaVisitaEntity } from './acta-visita.entity';
import { CriterioEntity } from '../../estandar/entities/criterio.entity';
import { CriterioVersionEntity } from '../../estandar/entities/criterio-version.entity';

@Entity('visita_resultado_item')
@Index('idx_visita_resultado_visita', ['visitaId'])
@Index('idx_visita_resultado_acta', ['actaId'])
@Index('idx_visita_resultado_criterio', ['criterioId'])
export class VisitaResultadoItemEntity extends BaseAuditableEntity {
  @Column({ name: 'visita_id', type: 'bigint', unsigned: true })
  visitaId: number;

  @Column({ name: 'acta_id', type: 'bigint', unsigned: true, nullable: true })
  actaId: number | null;

  @Column({ name: 'criterio_id', type: 'bigint', unsigned: true })
  criterioId: number;

  @Column({ name: 'criterio_version_id', type: 'bigint', unsigned: true })
  criterioVersionId: number;

  @Column({ type: 'enum', enum: CumpleEnum })
  cumple: CumpleEnum;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calificacion: number | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'json', nullable: true })
  evidencia: Record<string, unknown> | null;

  @ManyToOne(() => VisitaEntity, (visita) => visita.resultadoItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visita_id' })
  visita: VisitaEntity;

  @ManyToOne(() => ActaVisitaEntity, (acta) => acta.resultadoItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'acta_id' })
  acta: ActaVisitaEntity | null;

  @ManyToOne(() => CriterioEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'criterio_id' })
  criterio: CriterioEntity;

  @ManyToOne(() => CriterioVersionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'criterio_version_id' })
  criterioVersion: CriterioVersionEntity;
}
