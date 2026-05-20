import { Column, Entity, Index } from 'typeorm';
import { BaseAuditableEntity } from '../../../common/entities/base-auditable.entity';
import { MediaOwnerTypeEnum } from '../../../common/enums';

@Entity('media')
@Index('idx_media_owner', ['ownerType', 'ownerId'])
@Index('idx_media_checksum', ['checksum'])
export class MediaEntity extends BaseAuditableEntity {
  @Column({ name: 'owner_type', type: 'enum', enum: MediaOwnerTypeEnum })
  ownerType: MediaOwnerTypeEnum;

  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId: number;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 120 })
  mimeType: string;

  @Column({ type: 'bigint', unsigned: true, default: 0 })
  size: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum: string | null;
}
