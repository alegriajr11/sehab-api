import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { DepartamentoEntity } from './departamento.entity';
import { PrestadorEntity } from '../../prestador/entities/prestador.entity';
import { SedeEntity } from '../../prestador/entities/sede.entity';

@Entity('municipio')
@Index('idx_municipio_departamento', ['departamentoId'])
@Index('idx_municipio_codigo_dane', ['codigoDane'], { unique: true })
export class MunicipioEntity extends BaseCatalogEntity {
  @Column({ name: 'departamento_id', type: 'bigint', unsigned: true })
  departamentoId: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'codigo_dane', type: 'varchar', length: 8 })
  codigoDane: string;

  @ManyToOne(() => DepartamentoEntity, (departamento) => departamento.municipios, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'departamento_id' })
  departamento: DepartamentoEntity;

  @OneToMany(() => PrestadorEntity, (prestador) => prestador.municipio)
  prestadores: PrestadorEntity[];

  @OneToMany(() => SedeEntity, (sede) => sede.municipio)
  sedes: SedeEntity[];
}
