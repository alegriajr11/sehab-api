import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { PrestadorEntity } from '../../prestador/entities/prestador.entity';
import { SedeEntity } from '../../prestador/entities/sede.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';

@Entity('certificado_habilitacion')
@Index('idx_certificado_prestador', ['prestadorId'])
@Index('idx_certificado_numero', ['numeroCertificado'], { unique: true })
@Index('idx_certificado_vigencia', ['fechaVigenciaInicio', 'fechaVigenciaFin'])
export class CertificadoHabilitacionEntity extends BaseAuditableEntity {
  @Column({ name: 'prestador_id', type: 'bigint', unsigned: true })
  prestadorId: number;

  @Column({ name: 'sede_id', type: 'bigint', unsigned: true, nullable: true })
  sedeId: number | null;

  @Column({ name: 'servicio_habilitado_id', type: 'bigint', unsigned: true, nullable: true })
  servicioHabilitadoId: number | null;

  @Column({ name: 'numero_certificado', type: 'varchar', length: 50 })
  numeroCertificado: string;

  @Column({ name: 'fecha_emision', type: 'datetime' })
  fechaEmision: Date;

  @Column({ name: 'fecha_vigencia_inicio', type: 'date' })
  fechaVigenciaInicio: Date;

  @Column({ name: 'fecha_vigencia_fin', type: 'date', nullable: true })
  fechaVigenciaFin: Date | null;

  @Column({ name: 'documento_url', type: 'varchar', length: 500, nullable: true })
  documentoUrl: string | null;

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
