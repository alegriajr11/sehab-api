import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { ActividadCriterioEntity } from './actividad-criterio.entity';

@Entity('actividad')
@Index('idx_actividad_modulo', ['modulo'])
@Index('idx_actividad_nombre', ['nombre'])
export class ActividadEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'varchar', length: 80 })
  modulo: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => ActividadCriterioEntity, (ac) => ac.actividad)
  actividadesCriterio: ActividadCriterioEntity[];
}
