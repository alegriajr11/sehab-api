import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { VisitaEstadoEnum, VisitaTipoEnum } from '../../../common/enums';
import { PrestadorEntity } from '../../prestador/entities/prestador.entity';
import { SedeEntity } from '../../prestador/entities/sede.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';
import { VisitaParticipanteEntity } from './visita-participante.entity';
import { ActaVisitaEntity } from './acta-visita.entity';
import { VisitaResultadoItemEntity } from './visita-resultado-item.entity';

@Entity('visita')
@Index('idx_visita_prestador', ['prestadorId'])
@Index('idx_visita_sede', ['sedeId'])
@Index('idx_visita_servicio', ['servicioHabilitadoId'])
@Index('idx_visita_fecha_programada', ['fechaProgramada'])
@Index('idx_visita_estado', ['estado'])
export class VisitaEntity extends BaseAuditableEntity {
  @Column({ name: 'prestador_id', type: 'bigint', unsigned: true })
  prestadorId: number;

  @Column({ name: 'sede_id', type: 'bigint', unsigned: true, nullable: true })
  sedeId: number | null;

  @Column({ name: 'servicio_habilitado_id', type: 'bigint', unsigned: true, nullable: true })
  servicioHabilitadoId: number | null;

  @Column({ name: 'creada_por_id', type: 'bigint', unsigned: true, nullable: true })
  creadaPorId: number | null;

  @Column({ name: 'tipo_visita', type: 'enum', enum: VisitaTipoEnum })
  tipoVisita: VisitaTipoEnum;

  @Column({ name: 'fecha_programada', type: 'datetime', nullable: true })
  fechaProgramada: Date | null;

  @Column({ name: 'fecha_inicio', type: 'datetime', nullable: true })
  fechaInicio: Date | null;

  @Column({ name: 'fecha_fin', type: 'datetime', nullable: true })
  fechaFin: Date | null;

  @Column({
    type: 'enum',
    enum: VisitaEstadoEnum,
    default: VisitaEstadoEnum.PROGRAMADA,
  })
  estado: VisitaEstadoEnum;

  @Column({ name: 'resultado_global', type: 'json', nullable: true })
  resultadoGlobal: Record<string, unknown> | null;

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

  @ManyToOne(() => UsuarioEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'creada_por_id' })
  creadaPor: UsuarioEntity | null;

  @OneToMany(() => VisitaParticipanteEntity, (participante) => participante.visita)
  participantes: VisitaParticipanteEntity[];

  @OneToMany(() => ActaVisitaEntity, (acta) => acta.visita)
  actas: ActaVisitaEntity[];

  @OneToMany(() => VisitaResultadoItemEntity, (item) => item.visita)
  resultadoItems: VisitaResultadoItemEntity[];
}
