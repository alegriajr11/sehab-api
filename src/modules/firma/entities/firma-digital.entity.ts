import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity('firma_digital')
@Index('idx_firma_digital_usuario', ['usuarioId'], { unique: true })
export class FirmaDigitalEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true })
  usuarioId: number;

  @Column({ name: 'firma_certificado', type: 'text', nullable: true })
  firmaCertificado: string | null;

  @Column({ name: 'firma_url', type: 'varchar', length: 500 })
  firmaUrl: string;

  @CreateDateColumn({ name: 'creada_en', type: 'datetime', precision: 6 })
  creadaEn: Date;

  @OneToOne(() => UsuarioEntity, (usuario) => usuario.firmaDigital, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity;
}
