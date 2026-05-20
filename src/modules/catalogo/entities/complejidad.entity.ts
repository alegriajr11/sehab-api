import { Column, Entity, Index } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';

@Entity('complejidad')
@Index('idx_complejidad_nivel', ['nivel'], { unique: true })
export class ComplejidadEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 50 })
  nivel: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}
