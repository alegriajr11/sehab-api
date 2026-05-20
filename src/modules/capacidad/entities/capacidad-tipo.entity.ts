import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { CapacidadInstaladaEntity } from './capacidad-instalada.entity';

@Entity('capacidad_tipo')
@Index('idx_capacidad_tipo_codigo', ['codigo'], { unique: true })
export class CapacidadTipoEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 30 })
  codigo: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @OneToMany(
    () => CapacidadInstaladaEntity,
    (capacidad) => capacidad.capacidadTipo,
  )
  capacidadesInstaladas: CapacidadInstaladaEntity[];
}
