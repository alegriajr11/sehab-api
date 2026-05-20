import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { ActaVisitaEntity } from './acta-visita.entity';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

@Entity('acta_firma')
@Index('idx_acta_firma_acta', ['actaId'])
@Index('idx_acta_firma_usuario', ['usuarioId'])
export class ActaFirmaEntity extends BaseAuditableEntity {
  @Column({ name: 'acta_id', type: 'bigint', unsigned: true })
  actaId: number;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true, nullable: true })
  usuarioId: number | null;

  @Column({ name: 'nombre_externo', type: 'varchar', length: 255, nullable: true })
  nombreExterno: string | null;

  @Column({ type: 'varchar', length: 80 })
  rol: string;

  @Column({ name: 'firma_url', type: 'varchar', length: 500, nullable: true })
  firmaUrl: string | null;

  @Column({ name: 'fecha_firma', type: 'datetime', nullable: true })
  fechaFirma: Date | null;

  @ManyToOne(() => ActaVisitaEntity, (acta) => acta.firmas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'acta_id' })
  acta: ActaVisitaEntity;

  @ManyToOne(() => UsuarioEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity | null;
}
