import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { ServicioHabilitadoEntity } from '../../prestador/entities/servicio-habilitado.entity';
import { CriterioAplicacionEntity } from '../../estandar/entities/criterio-aplicacion.entity';

@Entity('complejidad')
@Index('idx_complejidad_nivel', ['nivel'], { unique: true })
export class ComplejidadEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 50 })
  nivel: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @OneToMany(
    () => ServicioHabilitadoEntity,
    (habilitado) => habilitado.complejidad,
  )
  serviciosHabilitados: ServicioHabilitadoEntity[];

  @OneToMany(
    () => CriterioAplicacionEntity,
    (aplicacion) => aplicacion.complejidad,
  )
  criteriosAplicacion: CriterioAplicacionEntity[];
}
