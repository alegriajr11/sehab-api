import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { VisitaEntity } from './visita.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity('visita_participante')
@Index('idx_visita_participante_visita', ['visitaId'])
@Index('idx_visita_participante_usuario', ['usuarioId'])
export class VisitaParticipanteEntity extends BaseAuditableEntity {
  @Column({ name: 'visita_id', type: 'bigint', unsigned: true })
  visitaId: number;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true, nullable: true })
  usuarioId: number | null;

  @Column({ name: 'nombre_externo', type: 'varchar', length: 255, nullable: true })
  nombreExterno: string | null;

  @Column({ type: 'varchar', length: 80 })
  rol: string;

  @Column({ name: 'firma_url', type: 'varchar', length: 500, nullable: true })
  firmaUrl: string | null;

  @Column({ type: 'boolean', default: false })
  firmado: boolean;

  @ManyToOne(() => VisitaEntity, (visita) => visita.participantes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visita_id' })
  visita: VisitaEntity;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.participacionesVisita, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity | null;
}
