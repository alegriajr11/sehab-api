import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { GrupoServicioEntity } from './grupo-servicio.entity';
import { EspecificidadServicioEntity } from './especificidad-servicio.entity';

@Entity('servicio_catalogo')
@Index('idx_servicio_catalogo_grupo', ['grupoServicioId'])
@Index('idx_servicio_catalogo_codigo_reps', ['codigoReps'], { unique: true })
export class ServicioCatalogoEntity extends BaseCatalogEntity {
  @Column({ name: 'grupo_servicio_id', type: 'bigint', unsigned: true })
  grupoServicioId: number;

  @Column({ name: 'codigo_reps', type: 'varchar', length: 30 })
  codigoReps: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @ManyToOne(() => GrupoServicioEntity, (grupo) => grupo.servicios, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'grupo_servicio_id' })
  grupoServicio: GrupoServicioEntity;

  @OneToMany(
    () => EspecificidadServicioEntity,
    (especificidad) => especificidad.servicioCatalogo,
  )
  especificidades: EspecificidadServicioEntity[];
}
