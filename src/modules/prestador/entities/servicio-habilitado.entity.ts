import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { ServicioHabilitadoEstadoEnum } from '../../../common/enums';
import { SedeEntity } from './sede.entity';
import { ServicioCatalogoEntity } from '../../catalogo/entities/servicio-catalogo.entity';
import { ModalidadServicioEntity } from '../../catalogo/entities/modalidad-servicio.entity';
import { ComplejidadEntity } from '../../catalogo/entities/complejidad.entity';
import { EspecificidadServicioEntity } from '../../catalogo/entities/especificidad-servicio.entity';

@Entity('servicio_habilitado')
@Index('idx_servicio_habilitado_sede', ['sedeId'])
@Index('idx_servicio_habilitado_catalogo', ['servicioCatalogoId'])
@Index('idx_servicio_habilitado_codigo', ['codigoHabilitacion'])
@Index('idx_servicio_habilitado_estado', ['estado'])
@Index(
  'uq_servicio_habilitado_combinacion',
  ['sedeId', 'servicioCatalogoId', 'modalidadId', 'complejidadId', 'especificidadId'],
  { unique: true },
)
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

  @ManyToOne(() => ServicioCatalogoEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'servicio_catalogo_id' })
  servicioCatalogo: ServicioCatalogoEntity;

  @ManyToOne(() => ModalidadServicioEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'modalidad_id' })
  modalidad: ModalidadServicioEntity;

  @ManyToOne(() => ComplejidadEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'complejidad_id' })
  complejidad: ComplejidadEntity;

  @ManyToOne(() => EspecificidadServicioEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'especificidad_id' })
  especificidad: EspecificidadServicioEntity | null;
}
