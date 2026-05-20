import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { CriterioEntity } from './criterio.entity';

@Entity('estandar')
@Index('idx_estandar_codigo', ['codigo'], { unique: true })
@Index('idx_estandar_modulo', ['modulo'])
export class EstandarEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 30 })
  codigo: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'varchar', length: 80 })
  modulo: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => CriterioEntity, (criterio) => criterio.estandar)
  criterios: CriterioEntity[];
}
