import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseCatalogEntity } from '../../../common/entities/base-catalog.entity';
import { UsuarioEntity } from './usuario.entity';

@Entity('rol')
@Index('idx_rol_nombre', ['nombre'], { unique: true })
export class RolEntity extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => UsuarioEntity, (usuario) => usuario.rol)
  usuarios: UsuarioEntity[];
}
