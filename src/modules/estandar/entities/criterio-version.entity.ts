import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { CriterioEntity } from './criterio.entity';
import { AutoevaluacionItemEntity } from '../../evaluacion/entities/autoevaluacion-item.entity';
import { VisitaResultadoItemEntity } from '../../evaluacion/entities/visita-resultado-item.entity';

@Entity('criterio_version')
@Index('idx_criterio_version_criterio', ['criterioId'])
@Index('idx_criterio_version_vigencia', ['fechaVigenciaDesde', 'fechaVigenciaHasta'])
export class CriterioVersionEntity extends BaseCatalogEntity {
  @Column({ name: 'criterio_id', type: 'bigint', unsigned: true })
  criterioId: number;

  @Column({ type: 'varchar', length: 20 })
  version: string;

  @Column({ type: 'text' })
  texto: string;

  @Column({ name: 'fecha_vigencia_desde', type: 'date' })
  fechaVigenciaDesde: Date;

  @Column({ name: 'fecha_vigencia_hasta', type: 'date', nullable: true })
  fechaVigenciaHasta: Date | null;

  @ManyToOne(() => CriterioEntity, (criterio) => criterio.versiones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'criterio_id' })
  criterio: CriterioEntity;

  @OneToMany(() => AutoevaluacionItemEntity, (item) => item.criterioVersion)
  autoevaluacionItems: AutoevaluacionItemEntity[];

  @OneToMany(() => VisitaResultadoItemEntity, (item) => item.criterioVersion)
  visitaResultadoItems: VisitaResultadoItemEntity[];
}
