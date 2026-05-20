import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActividadEntity } from './actividad.entity';
import { CriterioEntity } from '../../estandar/entities/criterio.entity';

@Entity('actividad_criterio')
@Index('idx_actividad_criterio_actividad', ['actividadId'])
@Index('idx_actividad_criterio_criterio', ['criterioId'])
@Index('uq_actividad_criterio', ['actividadId', 'criterioId'], { unique: true })
export class ActividadCriterioEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'actividad_id', type: 'bigint', unsigned: true })
  actividadId: number;

  @Column({ name: 'criterio_id', type: 'bigint', unsigned: true })
  criterioId: number;

  @ManyToOne(() => ActividadEntity, (actividad) => actividad.actividadesCriterio, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'actividad_id' })
  actividad: ActividadEntity;

  @ManyToOne(() => CriterioEntity, (criterio) => criterio.actividadesCriterio, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'criterio_id' })
  criterio: CriterioEntity;
}
