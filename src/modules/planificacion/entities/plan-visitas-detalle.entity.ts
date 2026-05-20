import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { PlanVisitasEntity } from './plan-visitas.entity';
import { ServicioCatalogoEntity } from '../../catalogo/entities/servicio-catalogo.entity';

@Entity('plan_visitas_detalle')
@Index('idx_plan_visitas_detalle_plan', ['planVisitasId'])
@Index('idx_plan_visitas_detalle_servicio', ['servicioCatalogoId'])
export class PlanVisitasDetalleEntity extends BaseAuditableEntity {
  @Column({ name: 'plan_visitas_id', type: 'bigint', unsigned: true })
  planVisitasId: number;

  @Column({ name: 'servicio_catalogo_id', type: 'bigint', unsigned: true })
  servicioCatalogoId: number;

  @Column({ type: 'int', unsigned: true, default: 1 })
  prioridad: number;

  @Column({ name: 'periodo_programacion', type: 'varchar', length: 50 })
  periodoProgramacion: string;

  @ManyToOne(() => PlanVisitasEntity, (plan) => plan.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plan_visitas_id' })
  planVisitas: PlanVisitasEntity;

  @ManyToOne(
    () => ServicioCatalogoEntity,
    (servicio) => servicio.planesDetalle,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'servicio_catalogo_id' })
  servicioCatalogo: ServicioCatalogoEntity;
}
