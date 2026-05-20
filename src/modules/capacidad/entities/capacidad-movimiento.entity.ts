import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { CapacidadMovimientoTipoEnum } from '../../../common/enums';
import { CapacidadInstaladaEntity } from './capacidad-instalada.entity';

@Entity('capacidad_movimiento')
@Index('idx_capacidad_movimiento_capacidad', ['capacidadInstaladaId'])
@Index('idx_capacidad_movimiento_fecha', ['fechaMovimiento'])
export class CapacidadMovimientoEntity extends BaseAuditableEntity {
  @Column({ name: 'capacidad_instalada_id', type: 'bigint', unsigned: true })
  capacidadInstaladaId: number;

  @Column({
    type: 'enum',
    enum: CapacidadMovimientoTipoEnum,
  })
  movimiento: CapacidadMovimientoTipoEnum;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ name: 'fecha_movimiento', type: 'datetime' })
  fechaMovimiento: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  motivo: string | null;

  @ManyToOne(
    () => CapacidadInstaladaEntity,
    (capacidad) => capacidad.movimientos,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'capacidad_instalada_id' })
  capacidadInstalada: CapacidadInstaladaEntity;
}
