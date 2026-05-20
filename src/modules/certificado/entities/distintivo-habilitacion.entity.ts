import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { PrestadorEntity } from '../../prestador/entities/prestador.entity';
import { SedeEntity } from '../../prestador/entities/sede.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';

@Entity('distintivo_habilitacion')
@Index('idx_distintivo_prestador', ['prestadorId'])
@Index('idx_distintivo_codigo', ['codigoDistintivo'], { unique: true })
export class DistintivoHabilitacionEntity extends BaseAuditableEntity {
  @Column({ name: 'prestador_id', type: 'bigint', unsigned: true })
  prestadorId: number;

  @Column({ name: 'sede_id', type: 'bigint', unsigned: true, nullable: true })
  sedeId: number | null;

  @Column({ name: 'servicio_habilitado_id', type: 'bigint', unsigned: true, nullable: true })
  servicioHabilitadoId: number | null;

  @Column({ name: 'codigo_distintivo', type: 'varchar', length: 50 })
  codigoDistintivo: string;

  @Column({ name: 'fecha_generacion', type: 'datetime' })
  fechaGeneracion: Date;

  @Column({ name: 'valido_hasta', type: 'date', nullable: true })
  validoHasta: Date | null;

  @Column({ name: 'url_imagen', type: 'varchar', length: 500, nullable: true })
  urlImagen: string | null;

  @ManyToOne(() => PrestadorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prestador_id' })
  prestador: PrestadorEntity;

  @ManyToOne(() => SedeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sede_id' })
  sede: SedeEntity | null;

  @ManyToOne(() => ServicioHabilitadoEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'servicio_habilitado_id' })
  servicioHabilitado: ServicioHabilitadoEntity | null;
}
