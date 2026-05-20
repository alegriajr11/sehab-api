import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { ServicioHabilitadoEstadoEnum } from '../../../common/enums';
import { SedeEntity } from './sede.entity';
import { ServicioCatalogoEntity } from '../../catalogo/entities/servicio-catalogo.entity';
import { ModalidadServicioEntity } from '../../catalogo/entities/modalidad-servicio.entity';
import { ComplejidadEntity } from '../../catalogo/entities/complejidad.entity';
import { EspecificidadServicioEntity } from '../../catalogo/entities/especificidad-servicio.entity';
import { CapacidadInstaladaEntity } from '../../capacidad/entities/capacidad-instalada.entity';
import { AutoevaluacionEntity } from '../../evaluacion/entities/autoevaluacion.entity';
import { VisitaEntity } from '../../evaluacion/entities/visita.entity';
import { NovedadEntity } from '../../novedad/entities/novedad.entity';
import { CertificadoHabilitacionEntity } from '../../certificado/entities/certificado-habilitacion.entity';
import { DistintivoHabilitacionEntity } from '../../certificado/entities/distintivo-habilitacion.entity';

@Entity('servicio_habilitado')
@Index('idx_servicio_habilitado_sede', ['sedeId'])
@Index('idx_servicio_habilitado_catalogo', ['servicioCatalogoId'])
@Index('idx_servicio_habilitado_codigo', ['codigoHabilitacion'])
@Index('idx_servicio_habilitado_estado', ['estado'])
export class ServicioHabilitadoEntity extends BaseAuditableEntity {
  @Column({ name: 'sede_id', type: 'bigint', unsigned: true })
  sedeId: number;

  @Column({ name: 'servicio_catalogo_id', type: 'bigint', unsigned: true })
  servicioCatalogoId: number;

  @Column({ name: 'modalidad_id', type: 'bigint', unsigned: true })
  modalidadId: number;

  @Column({ name: 'complejidad_id', type: 'bigint', unsigned: true })
  complejidadId: number;

  @Column({ name: 'especificidad_id', type: 'bigint', unsigned: true, nullable: true })
  especificidadId: number | null;

  @Column({ name: 'codigo_habilitacion', type: 'varchar', length: 50 })
  codigoHabilitacion: string;

  @Column({ name: 'fecha_habilitacion', type: 'date', nullable: true })
  fechaHabilitacion: Date | null;

  @Column({
    type: 'enum',
    enum: ServicioHabilitadoEstadoEnum,
    default: ServicioHabilitadoEstadoEnum.HABILITADO,
  })
  estado: ServicioHabilitadoEstadoEnum;

  @ManyToOne(() => SedeEntity, (sede) => sede.serviciosHabilitados, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sede_id' })
  sede: SedeEntity;

  @ManyToOne(
    () => ServicioCatalogoEntity,
    (catalogo) => catalogo.serviciosHabilitados,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'servicio_catalogo_id' })
  servicioCatalogo: ServicioCatalogoEntity;

  @ManyToOne(() => ModalidadServicioEntity, (modalidad) => modalidad.serviciosHabilitados, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'modalidad_id' })
  modalidad: ModalidadServicioEntity;

  @ManyToOne(() => ComplejidadEntity, (complejidad) => complejidad.serviciosHabilitados, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'complejidad_id' })
  complejidad: ComplejidadEntity;

  @ManyToOne(
    () => EspecificidadServicioEntity,
    (especificidad) => especificidad.serviciosHabilitados,
    { onDelete: 'SET NULL', nullable: true },
  )
  @JoinColumn({ name: 'especificidad_id' })
  especificidad: EspecificidadServicioEntity | null;

  @OneToMany(
    () => CapacidadInstaladaEntity,
    (capacidad) => capacidad.servicioHabilitado,
  )
  capacidadesInstaladas: CapacidadInstaladaEntity[];

  @OneToMany(() => AutoevaluacionEntity, (autoeval) => autoeval.servicioHabilitado)
  autoevaluaciones: AutoevaluacionEntity[];

  @OneToMany(() => VisitaEntity, (visita) => visita.servicioHabilitado)
  visitas: VisitaEntity[];

  @OneToMany(() => NovedadEntity, (novedad) => novedad.servicioHabilitado)
  novedades: NovedadEntity[];

  @OneToMany(
    () => CertificadoHabilitacionEntity,
    (certificado) => certificado.servicioHabilitado,
  )
  certificados: CertificadoHabilitacionEntity[];

  @OneToMany(
    () => DistintivoHabilitacionEntity,
    (distintivo) => distintivo.servicioHabilitado,
  )
  distintivos: DistintivoHabilitacionEntity[];
}
