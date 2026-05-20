import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { PlanVisitasEstadoEnum } from '../../../common/enums';
import { PlanVisitasDetalleEntity } from './plan-visitas-detalle.entity';

@Entity('plan_visitas')
@Index('idx_plan_visitas_entidad', ['entidadTerritorial'])
@Index('idx_plan_visitas_vigencia', ['vigencia'])
@Index('idx_plan_visitas_estado', ['estado'])
export class PlanVisitasEntity extends BaseAuditableEntity {
  @Column({ name: 'entidad_territorial', type: 'varchar', length: 255 })
  entidadTerritorial: string;

  @Column({ type: 'varchar', length: 20 })
  vigencia: string;

  @Column({ name: 'fecha_formulado', type: 'date', nullable: true })
  fechaFormulado: Date | null;

  @Column({
    type: 'enum',
    enum: PlanVisitasEstadoEnum,
    default: PlanVisitasEstadoEnum.BORRADOR,
  })
  estado: PlanVisitasEstadoEnum;

  @OneToMany(() => PlanVisitasDetalleEntity, (detalle) => detalle.planVisitas)
  detalles: PlanVisitasDetalleEntity[];
}
