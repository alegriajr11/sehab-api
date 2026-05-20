import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Entity('auditoria')
@Index('idx_auditoria_usuario', ['usuarioId'])
@Index('idx_auditoria_tabla_registro', ['tablaAfectada', 'registroId'])
@Index('idx_auditoria_fecha', ['fecha'])
export class AuditoriaEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true, nullable: true })
  usuarioId: number | null;

  @Column({ type: 'varchar', length: 50 })
  accion: string;

  @Column({ name: 'tabla_afectada', type: 'varchar', length: 100 })
  tablaAfectada: string;

  @Column({ name: 'registro_id', type: 'bigint', unsigned: true, nullable: true })
  registroId: number | null;

  @Column({ type: 'json', nullable: true })
  detalles: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'fecha', type: 'datetime', precision: 6 })
  fecha: Date;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.auditorias, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity | null;
}
