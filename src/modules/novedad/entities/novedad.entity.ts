import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { NovedadEstadoEnum, NovedadTipoEnum } from '../../../common/enums';
import { PrestadorEntity } from '../../prestador/entities/prestador.entity';
import { SedeEntity } from '../../prestador/entities/sede.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';
import { CapacidadInstaladaEntity } from '../../capacidad/entities/capacidad-instalada.entity';

@Entity('novedad')
@Index('idx_novedad_prestador', ['prestadorId'])
@Index('idx_novedad_fecha_reporte', ['fechaReporte'])
@Index('idx_novedad_estado', ['estado'])
@Index('idx_novedad_tipo', ['tipoNovedad'])
export class NovedadEntity extends BaseAuditableEntity {
  @Column({ name: 'prestador_id', type: 'bigint', unsigned: true })
  prestadorId: number;

  @Column({ name: 'sede_id', type: 'bigint', unsigned: true, nullable: true })
  sedeId: number | null;

  @Column({ name: 'servicio_habilitado_id', type: 'bigint', unsigned: true, nullable: true })
  servicioHabilitadoId: number | null;

  @Column({ name: 'capacidad_instalada_id', type: 'bigint', unsigned: true, nullable: true })
  capacidadInstaladaId: number | null;

  @Column({ name: 'tipo_novedad', type: 'enum', enum: NovedadTipoEnum })
  tipoNovedad: NovedadTipoEnum;

  @Column({ type: 'varchar', length: 80, nullable: true })
  subtipo: string | null;

  @Column({ name: 'fecha_reporte', type: 'datetime' })
  fechaReporte: Date;

  @Column({
    type: 'enum',
    enum: NovedadEstadoEnum,
    default: NovedadEstadoEnum.REPORTADA,
  })
  estado: NovedadEstadoEnum;

  @Column({ name: 'documento_soporte_url', type: 'varchar', length: 500, nullable: true })
  documentoSoporteUrl: string | null;

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

  @ManyToOne(() => CapacidadInstaladaEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'capacidad_instalada_id' })
  capacidadInstalada: CapacidadInstaladaEntity | null;
}
