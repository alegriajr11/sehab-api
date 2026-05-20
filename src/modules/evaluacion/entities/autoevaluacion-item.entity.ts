import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { CumpleEnum } from '../../../common/enums';
import { AutoevaluacionEntity } from './autoevaluacion.entity';
import { CriterioEntity } from '../../estandar/entities/criterio.entity';
import { CriterioVersionEntity } from '../../estandar/entities/criterio-version.entity';

@Entity('autoevaluacion_item')
@Index('idx_autoevaluacion_item_autoevaluacion', ['autoevaluacionId'])
@Index('idx_autoevaluacion_item_criterio', ['criterioId'])
export class AutoevaluacionItemEntity extends BaseAuditableEntity {
  @Column({ name: 'autoevaluacion_id', type: 'bigint', unsigned: true })
  autoevaluacionId: number;

  @Column({ name: 'criterio_id', type: 'bigint', unsigned: true })
  criterioId: number;

  @Column({ name: 'criterio_version_id', type: 'bigint', unsigned: true })
  criterioVersionId: number;

  @Column({ type: 'enum', enum: CumpleEnum })
  cumple: CumpleEnum;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  puntos: number | null;

  @Column({ name: 'evidencia_url', type: 'varchar', length: 500, nullable: true })
  evidenciaUrl: string | null;

  @ManyToOne(
    () => AutoevaluacionEntity,
    (autoevaluacion) => autoevaluacion.items,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'autoevaluacion_id' })
  autoevaluacion: AutoevaluacionEntity;

  @ManyToOne(() => CriterioEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'criterio_id' })
  criterio: CriterioEntity;

  @ManyToOne(() => CriterioVersionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'criterio_version_id' })
  criterioVersion: CriterioVersionEntity;
}
