import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { ActaEstadoEnum } from '../../../common/enums';
import { VisitaEntity } from './visita.entity';
import { ActaFirmaEntity } from './acta-firma.entity';
import { VisitaResultadoItemEntity } from './visita-resultado-item.entity';

@Entity('acta_visita')
@Index('idx_acta_visita_visita', ['visitaId'])
@Index('idx_acta_visita_numero', ['numeroActa'], { unique: true })
export class ActaVisitaEntity extends BaseAuditableEntity {
  @Column({ name: 'visita_id', type: 'bigint', unsigned: true })
  visitaId: number;

  @Column({ name: 'numero_acta', type: 'varchar', length: 50 })
  numeroActa: string;

  @Column({ name: 'fecha_emision', type: 'datetime', nullable: true })
  fechaEmision: Date | null;

  @Column({
    type: 'enum',
    enum: ActaEstadoEnum,
    default: ActaEstadoEnum.BORRADOR,
  })
  estado: ActaEstadoEnum;

  @Column({ name: 'documento_url', type: 'varchar', length: 500, nullable: true })
  documentoUrl: string | null;

  @ManyToOne(() => VisitaEntity, (visita) => visita.actas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visita_id' })
  visita: VisitaEntity;

  @OneToMany(() => ActaFirmaEntity, (firma) => firma.acta)
  firmas: ActaFirmaEntity[];

  @OneToMany(() => VisitaResultadoItemEntity, (item) => item.acta)
  resultadoItems: VisitaResultadoItemEntity[];
}
