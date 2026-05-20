import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { ServicioCatalogoEntity } from './servicio-catalogo.entity';

@Entity('especificidad_servicio')
@Index('idx_especificidad_servicio_catalogo', ['servicioCatalogoId'])
@Index('idx_especificidad_servicio_codigo', ['codigo'])
export class EspecificidadServicioEntity extends BaseCatalogEntity {
  @Column({ name: 'servicio_catalogo_id', type: 'bigint', unsigned: true })
  servicioCatalogoId: number;

  @Column({ type: 'varchar', length: 30 })
  codigo: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @ManyToOne(
    () => ServicioCatalogoEntity,
    (servicio) => servicio.especificidades,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'servicio_catalogo_id' })
  servicioCatalogo: ServicioCatalogoEntity;
}
