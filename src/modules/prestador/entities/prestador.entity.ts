import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { PrestadorEstadoEnum } from '../../../common/enums';
import { MunicipioEntity } from '../../catalogo/entities/municipio.entity';
import { SedeEntity } from './sede.entity';

@Entity('prestador')
@Index('idx_prestador_nit', ['nit'], { unique: true })
@Index('idx_prestador_reps_codigo', ['repsCodigo'])
@Index('idx_prestador_municipio', ['municipioId'])
@Index('idx_prestador_estado', ['estado'])
export class PrestadorEntity extends BaseAuditableEntity {
  @Column({ type: 'varchar', length: 20 })
  nit: string;

  @Column({ name: 'nombre_razon_social', type: 'varchar', length: 300 })
  nombreRazonSocial: string;

  @Column({ name: 'reps_codigo', type: 'varchar', length: 30, nullable: true })
  repsCodigo: string | null;

  @Column({
    type: 'enum',
    enum: PrestadorEstadoEnum,
    default: PrestadorEstadoEnum.ACTIVO,
  })
  estado: PrestadorEstadoEnum;

  @Column({ name: 'vigencia_desde', type: 'date', nullable: true })
  vigenciaDesde: Date | null;

  @Column({ name: 'vigencia_hasta', type: 'date', nullable: true })
  vigenciaHasta: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'municipio_id', type: 'bigint', unsigned: true })
  municipioId: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @ManyToOne(() => MunicipioEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'municipio_id' })
  municipio: MunicipioEntity;

  @OneToMany(() => SedeEntity, (sede) => sede.prestador)
  sedes: SedeEntity[];
}
