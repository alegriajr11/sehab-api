import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { EstandarEntity } from './estandar.entity';
import { CriterioVersionEntity } from './criterio-version.entity';
import { CriterioAplicacionEntity } from './criterio-aplicacion.entity';
import { AutoevaluacionItemEntity } from '../../evaluacion/entities/autoevaluacion-item.entity';
import { VisitaResultadoItemEntity } from '../../evaluacion/entities/visita-resultado-item.entity';
import { ActividadCriterioEntity } from '../../pamec/entities/actividad-criterio.entity';

@Entity('criterio')
@Index('idx_criterio_codigo', ['codigo'], { unique: true })
@Index('idx_criterio_estandar', ['estandarId'])
@Index('idx_criterio_categoria', ['categoria'])
export class CriterioEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 30 })
  codigo: string;

  @Column({ type: 'varchar', length: 500 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'estandar_id', type: 'bigint', unsigned: true })
  estandarId: number;

  @Column({ type: 'varchar', length: 80, nullable: true })
  categoria: string | null;

  @Column({ name: 'nivel_complejidad', type: 'varchar', length: 50, nullable: true })
  nivelComplejidad: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => EstandarEntity, (estandar) => estandar.criterios, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'estandar_id' })
  estandar: EstandarEntity;

  @OneToMany(() => CriterioVersionEntity, (version) => version.criterio)
  versiones: CriterioVersionEntity[];

  @OneToMany(() => CriterioAplicacionEntity, (aplicacion) => aplicacion.criterio)
  aplicaciones: CriterioAplicacionEntity[];

  @OneToMany(() => AutoevaluacionItemEntity, (item) => item.criterio)
  autoevaluacionItems: AutoevaluacionItemEntity[];

  @OneToMany(() => VisitaResultadoItemEntity, (item) => item.criterio)
  visitaResultadoItems: VisitaResultadoItemEntity[];

  @OneToMany(() => ActividadCriterioEntity, (ac) => ac.criterio)
  actividadesCriterio: ActividadCriterioEntity[];
}
