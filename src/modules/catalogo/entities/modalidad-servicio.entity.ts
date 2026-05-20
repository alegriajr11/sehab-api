import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';
import { CriterioAplicacionEntity } from '../../estandar/entities/criterio-aplicacion.entity';

@Entity('modalidad_servicio')
@Index('idx_modalidad_servicio_nombre', ['nombre'])
export class ModalidadServicioEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @OneToMany(
    () => ServicioHabilitadoEntity,
    (habilitado) => habilitado.modalidad,
  )
  serviciosHabilitados: ServicioHabilitadoEntity[];

  @OneToMany(
    () => CriterioAplicacionEntity,
    (aplicacion) => aplicacion.modalidad,
  )
  criteriosAplicacion: CriterioAplicacionEntity[];
}
