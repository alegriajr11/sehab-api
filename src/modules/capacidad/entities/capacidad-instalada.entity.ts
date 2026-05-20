import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { PrestadorEntity } from '../../prestador/entities/prestador.entity';
import { SedeEntity } from '../../prestador/entities/sede.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';
import { CapacidadTipoEntity } from './capacidad-tipo.entity';
import { CapacidadMovimientoEntity } from './capacidad-movimiento.entity';

@Entity('capacidad_instalada')
@Index('idx_capacidad_instalada_prestador', ['prestadorId'])
@Index('idx_capacidad_instalada_sede', ['sedeId'])
@Index('idx_capacidad_instalada_servicio', ['servicioHabilitadoId'])
@Index(
  'uq_capacidad_instalada_servicio_tipo',
  ['servicioHabilitadoId', 'capacidadTipoId'],
  { unique: true },
)
export class CapacidadInstaladaEntity extends BaseAuditableEntity {
  @Column({ name: 'prestador_id', type: 'bigint', unsigned: true })
  prestadorId: number;

  @Column({ name: 'sede_id', type: 'bigint', unsigned: true })
  sedeId: number;

  @Column({ name: 'servicio_habilitado_id', type: 'bigint', unsigned: true })
  servicioHabilitadoId: number;

  @Column({ name: 'capacidad_tipo_id', type: 'bigint', unsigned: true })
  capacidadTipoId: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  cantidad: number;

  @Column({ type: 'json', nullable: true })
  detalle: Record<string, unknown> | null;

  @ManyToOne(() => PrestadorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prestador_id' })
  prestador: PrestadorEntity;

  @ManyToOne(() => SedeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sede_id' })
  sede: SedeEntity;

  @ManyToOne(() => ServicioHabilitadoEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'servicio_habilitado_id' })
  servicioHabilitado: ServicioHabilitadoEntity;

  @ManyToOne(() => CapacidadTipoEntity, (tipo) => tipo.capacidadesInstaladas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'capacidad_tipo_id' })
  capacidadTipo: CapacidadTipoEntity;

  @OneToMany(
    () => CapacidadMovimientoEntity,
    (movimiento) => movimiento.capacidadInstalada,
  )
  movimientos: CapacidadMovimientoEntity[];
}
