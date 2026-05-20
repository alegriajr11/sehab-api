import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { AutoevaluacionEstadoEnum } from '../../../common/enums';
import { PrestadorEntity } from '../../prestador/entities/prestador.entity';
import { SedeEntity } from '../../prestador/entities/sede.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';
import { AutoevaluacionItemEntity } from './autoevaluacion-item.entity';

@Entity('autoevaluacion')
@Index('idx_autoevaluacion_prestador', ['prestadorId'])
@Index('idx_autoevaluacion_sede', ['sedeId'])
@Index('idx_autoevaluacion_servicio', ['servicioHabilitadoId'])
@Index('idx_autoevaluacion_periodo', ['periodoInicio', 'periodoFin'])
@Index('idx_autoevaluacion_estado', ['estado'])
export class AutoevaluacionEntity extends BaseAuditableEntity {
  @Column({ name: 'prestador_id', type: 'bigint', unsigned: true })
  prestadorId: number;

  @Column({ name: 'sede_id', type: 'bigint', unsigned: true })
  sedeId: number;

  @Column({ name: 'servicio_habilitado_id', type: 'bigint', unsigned: true })
  servicioHabilitadoId: number;

  @Column({ name: 'creado_por_id', type: 'bigint', unsigned: true, nullable: true })
  creadoPorId: number | null;

  @Column({ name: 'periodo_inicio', type: 'date' })
  periodoInicio: Date;

  @Column({ name: 'periodo_fin', type: 'date' })
  periodoFin: Date;

  @Column({ name: 'fecha_realizacion', type: 'datetime', nullable: true })
  fechaRealizacion: Date | null;

  @Column({ name: 'declarada_en_reps', type: 'boolean', default: false })
  declaradaEnReps: boolean;

  @Column({
    type: 'enum',
    enum: AutoevaluacionEstadoEnum,
    default: AutoevaluacionEstadoEnum.BORRADOR,
  })
  estado: AutoevaluacionEstadoEnum;

  @ManyToOne(() => PrestadorEntity, (prestador) => prestador.autoevaluaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'prestador_id' })
  prestador: PrestadorEntity;

  @ManyToOne(() => SedeEntity, (sede) => sede.autoevaluaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sede_id' })
  sede: SedeEntity;

  @ManyToOne(
    () => ServicioHabilitadoEntity,
    (servicio) => servicio.autoevaluaciones,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'servicio_habilitado_id' })
  servicioHabilitado: ServicioHabilitadoEntity;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.autoevaluacionesCreadas, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: UsuarioEntity | null;

  @OneToMany(() => AutoevaluacionItemEntity, (item) => item.autoevaluacion)
  items: AutoevaluacionItemEntity[];
}
