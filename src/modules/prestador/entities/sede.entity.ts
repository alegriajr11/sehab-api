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
import { PrestadorEntity } from './prestador.entity';
import { ServicioHabilitadoEntity } from './servicio-habilitado.entity';
import { CapacidadInstaladaEntity } from '../../capacidad/entities/capacidad-instalada.entity';
import { AutoevaluacionEntity } from '../../evaluacion/entities/autoevaluacion.entity';
import { VisitaEntity } from '../../evaluacion/entities/visita.entity';
import { NovedadEntity } from '../../novedad/entities/novedad.entity';
import { CertificadoHabilitacionEntity } from '../../certificado/entities/certificado-habilitacion.entity';
import { DistintivoHabilitacionEntity } from '../../certificado/entities/distintivo-habilitacion.entity';

@Entity('sede')
@Index('idx_sede_prestador', ['prestadorId'])
@Index('idx_sede_municipio', ['municipioId'])
@Index('idx_sede_reps_codigo', ['repsSedeCodigo'])
export class SedeEntity extends BaseAuditableEntity {
  @Column({ name: 'prestador_id', type: 'bigint', unsigned: true })
  prestadorId: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  principal: boolean;

  @Column({ name: 'municipio_id', type: 'bigint', unsigned: true })
  municipioId: number;

  @Column({
    type: 'enum',
    enum: PrestadorEstadoEnum,
    default: PrestadorEstadoEnum.ACTIVO,
  })
  estado: PrestadorEstadoEnum;

  @Column({ name: 'reps_sede_codigo', type: 'varchar', length: 30, nullable: true })
  repsSedeCodigo: string | null;

  @ManyToOne(() => PrestadorEntity, (prestador) => prestador.sedes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'prestador_id' })
  prestador: PrestadorEntity;

  @ManyToOne(() => MunicipioEntity, (municipio) => municipio.sedes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'municipio_id' })
  municipio: MunicipioEntity;

  @OneToMany(() => ServicioHabilitadoEntity, (servicio) => servicio.sede)
  serviciosHabilitados: ServicioHabilitadoEntity[];

  @OneToMany(() => CapacidadInstaladaEntity, (capacidad) => capacidad.sede)
  capacidadesInstaladas: CapacidadInstaladaEntity[];

  @OneToMany(() => AutoevaluacionEntity, (autoeval) => autoeval.sede)
  autoevaluaciones: AutoevaluacionEntity[];

  @OneToMany(() => VisitaEntity, (visita) => visita.sede)
  visitas: VisitaEntity[];

  @OneToMany(() => NovedadEntity, (novedad) => novedad.sede)
  novedades: NovedadEntity[];

  @OneToMany(
    () => CertificadoHabilitacionEntity,
    (certificado) => certificado.sede,
  )
  certificados: CertificadoHabilitacionEntity[];

  @OneToMany(
    () => DistintivoHabilitacionEntity,
    (distintivo) => distintivo.sede,
  )
  distintivos: DistintivoHabilitacionEntity[];
}
