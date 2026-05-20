import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { CriterioEntity } from './criterio.entity';
import { ServicioCatalogoEntity } from '../../catalogo/entities/servicio-catalogo.entity';
import { ModalidadServicioEntity } from '../../catalogo/entities/modalidad-servicio.entity';
import { ComplejidadEntity } from '../../catalogo/entities/complejidad.entity';
import { EspecificidadServicioEntity } from '../../catalogo/entities/especificidad-servicio.entity';

@Entity('criterio_aplicacion')
@Index('idx_criterio_aplicacion_criterio', ['criterioId'])
@Index('idx_criterio_aplicacion_servicio', ['servicioCatalogoId'])
export class CriterioAplicacionEntity extends BaseCatalogEntity {
  @Column({ name: 'criterio_id', type: 'bigint', unsigned: true })
  criterioId: number;

  @Column({ name: 'servicio_catalogo_id', type: 'bigint', unsigned: true, nullable: true })
  servicioCatalogoId: number | null;

  @Column({ name: 'modalidad_id', type: 'bigint', unsigned: true, nullable: true })
  modalidadId: number | null;

  @Column({ name: 'complejidad_id', type: 'bigint', unsigned: true, nullable: true })
  complejidadId: number | null;

  @Column({ name: 'especificidad_id', type: 'bigint', unsigned: true, nullable: true })
  especificidadId: number | null;

  @ManyToOne(() => CriterioEntity, (criterio) => criterio.aplicaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'criterio_id' })
  criterio: CriterioEntity;

  @ManyToOne(
    () => ServicioCatalogoEntity,
    (servicio) => servicio.criteriosAplicacion,
    { onDelete: 'SET NULL', nullable: true },
  )
  @JoinColumn({ name: 'servicio_catalogo_id' })
  servicioCatalogo: ServicioCatalogoEntity | null;

  @ManyToOne(() => ModalidadServicioEntity, (modalidad) => modalidad.criteriosAplicacion, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'modalidad_id' })
  modalidad: ModalidadServicioEntity | null;

  @ManyToOne(() => ComplejidadEntity, (complejidad) => complejidad.criteriosAplicacion, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'complejidad_id' })
  complejidad: ComplejidadEntity | null;

  @ManyToOne(
    () => EspecificidadServicioEntity,
    (especificidad) => especificidad.criteriosAplicacion,
    { onDelete: 'SET NULL', nullable: true },
  )
  @JoinColumn({ name: 'especificidad_id' })
  especificidad: EspecificidadServicioEntity | null;
}
