import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { RolEntity } from './rol.entity';
import { AuditoriaEntity } from './auditoria.entity';

@Entity('usuario')
@Index('idx_usuario_email', ['email'], { unique: true })
@Index('idx_usuario_rol', ['rolId'])
@Index('idx_usuario_activo', ['activo'])
export class UsuarioEntity extends BaseAuditableEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono: string | null;

  @Column({ name: 'rol_id', type: 'bigint', unsigned: true })
  rolId: number;

  @Column({ name: 'firma_digital_url', type: 'varchar', length: 500, nullable: true })
  firmaDigitalUrl: string | null;

  @Column({ name: 'ultimo_login', type: 'datetime', nullable: true })
  ultimoLogin: Date | null;

  @ManyToOne(() => RolEntity, (rol) => rol.usuarios, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rol_id' })
  rol: RolEntity;

  @OneToMany(() => AuditoriaEntity, (auditoria) => auditoria.usuario)
  auditorias: AuditoriaEntity[];
}
