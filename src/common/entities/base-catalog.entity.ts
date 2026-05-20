import { PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad base para catálogos normativos de referencia (sin timestamps).
 */
export abstract class BaseCatalogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;
}
