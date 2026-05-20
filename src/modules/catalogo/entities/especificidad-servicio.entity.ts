import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { ServicioCatalogoEntity } from './servicio-catalogo.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';
import { CriterioAplicacionEntity } from '../../estandar/entities/criterio-aplicacion.entity';

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

  @OneToMany(
    () => ServicioHabilitadoEntity,
    (habilitado) => habilitado.especificidad,
  )
  serviciosHabilitados: ServicioHabilitadoEntity[];

  @OneToMany(
    () => CriterioAplicacionEntity,
    (aplicacion) => aplicacion.especificidad,
  )
  criteriosAplicacion: CriterioAplicacionEntity[];
}
