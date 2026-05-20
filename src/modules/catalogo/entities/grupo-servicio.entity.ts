import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { ServicioCatalogoEntity } from './servicio-catalogo.entity';

@Entity('grupo_servicio')
@Index('idx_grupo_servicio_codigo', ['codigo'], { unique: true })
export class GrupoServicioEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @OneToMany(
    () => ServicioCatalogoEntity,
    (servicio) => servicio.grupoServicio,
  )
  servicios: ServicioCatalogoEntity[];
}
