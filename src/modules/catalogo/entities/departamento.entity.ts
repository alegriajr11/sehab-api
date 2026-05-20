import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { MunicipioEntity } from './municipio.entity';

@Entity('departamento')
@Index('idx_departamento_codigo_dane', ['codigoDane'], { unique: true })
export class DepartamentoEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'codigo_dane', type: 'varchar', length: 5 })
  codigoDane: string;

  @OneToMany(() => MunicipioEntity, (municipio) => municipio.departamento)
  municipios: MunicipioEntity[];
}
