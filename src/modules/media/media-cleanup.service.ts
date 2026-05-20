import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { MediaOwnerTypeEnum } from '../../common/enums';

/**
 * Mapeo de ownerType a la tabla correspondiente para verificar existencia.
 */
const OWNER_TABLE_MAP: Record<string, string | null> = {
  [MediaOwnerTypeEnum.PRESTADOR]: 'prestador',
  [MediaOwnerTypeEnum.SEDE]: 'sede',
  [MediaOwnerTypeEnum.SERVICIO_HABILITADO]: 'servicio_habilitado',
  [MediaOwnerTypeEnum.VISITA]: 'visita',
  [MediaOwnerTypeEnum.ACTA_VISITA]: 'acta_visita',
  [MediaOwnerTypeEnum.AUTOEVALUACION]: 'autoevaluacion',
  [MediaOwnerTypeEnum.NOVEDAD]: 'novedad',
  [MediaOwnerTypeEnum.CERTIFICADO]: 'certificado_habilitacion',
  [MediaOwnerTypeEnum.DISTINTIVO]: 'distintivo_habilitacion',
  [MediaOwnerTypeEnum.CRITERIO]: 'criterio',
  [MediaOwnerTypeEnum.USUARIO]: 'usuario',
  [MediaOwnerTypeEnum.OTRO]: null,
};

/**
 * Servicio de limpieza periódica de archivos media huérfanos.
 *
 * Ejecuta un cron job diario a las 3:00 AM que detecta registros en la tabla
 * `media` cuyo owner ya no existe en la tabla correspondiente, y los elimina.
 *
 * Estrategia:
 * - Para cada ownerType (excepto OTRO), ejecuta un LEFT JOIN contra la tabla owner.
 * - Los registros donde el owner es NULL son huérfanos.
 * - Se eliminan en lotes para no bloquear la BD.
 */
@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);
  private readonly BATCH_SIZE = 500;

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Cron job: se ejecuta todos los días a las 3:00 AM.
   * Detecta y elimina registros media huérfanos.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleOrphanCleanup(): Promise<void> {
    this.logger.log('Iniciando limpieza de archivos media huérfanos...');

    let totalDeleted = 0;

    for (const [ownerType, tableName] of Object.entries(OWNER_TABLE_MAP)) {
      if (!tableName) continue;

      try {
        const deleted = await this.cleanOrphansForType(ownerType, tableName);
        if (deleted > 0) {
          this.logger.log(
            `  → ${ownerType}: ${deleted} registros huérfanos eliminados`,
          );
          totalDeleted += deleted;
        }
      } catch (error) {
        this.logger.error(
          `Error limpiando huérfanos para ${ownerType}: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log(
      `Limpieza completada. Total eliminados: ${totalDeleted} registros huérfanos.`,
    );
  }

  /**
   * Elimina registros media huérfanos para un ownerType específico.
   * Usa DELETE con subquery para eficiencia en MySQL.
   */
  private async cleanOrphansForType(
    ownerType: string,
    tableName: string,
  ): Promise<number> {
    let totalDeleted = 0;
    let deletedInBatch: number;

    do {
      const result = await this.dataSource.query(
        `
        DELETE m FROM \`media\` m
        LEFT JOIN \`${tableName}\` t ON m.owner_id = t.id
        WHERE m.owner_type = ? AND t.id IS NULL
        LIMIT ?
        `,
        [ownerType, this.BATCH_SIZE],
      );

      deletedInBatch = result.affectedRows ?? 0;
      totalDeleted += deletedInBatch;
    } while (deletedInBatch === this.BATCH_SIZE);

    return totalDeleted;
  }
}
