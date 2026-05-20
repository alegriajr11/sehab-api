import { Column, Entity, Index } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';

@Entity('modalidad_servicio')
@Index('idx_modalidad_servicio_nombre', ['nombre'], { unique: true })
export class ModalidadServicioEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}
