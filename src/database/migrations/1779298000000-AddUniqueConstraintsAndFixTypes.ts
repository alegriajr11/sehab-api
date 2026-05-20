import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: Restricciones únicas compuestas + corrección de tipos de dato.
 *
 * Hallazgos corregidos:
 * - [CRÍTICA] servicio_habilitado: duplicados sede+servicio+modalidad+complejidad+especificidad
 * - [CRÍTICA] autoevaluacion_item: duplicados autoevaluacion+criterio
 * - [CRÍTICA] visita_resultado_item: duplicados visita+criterio
 * - [ALTA] criterio_aplicacion: duplicados en reglas de aplicabilidad
 * - [ALTA] criterio_version: duplicados criterio+version
 * - [ALTA] capacidad_instalada: duplicados servicio+tipo
 * - [ALTA] modalidad_servicio: nombre no era unique
 * - [ALTA] especificidad_servicio: duplicados servicio_catalogo+codigo
 * - [MEDIA] visita_participante: duplicados visita+usuario
 * - [BAJA] plan_visitas.vigencia: varchar → smallint unsigned
 * - [BAJA] capacidad_movimiento.cantidad: int signed → int unsigned
 */
export class AddUniqueConstraintsAndFixTypes1779298000000
  implements MigrationInterface
{
  name = 'AddUniqueConstraintsAndFixTypes1779298000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── CRÍTICA: servicio_habilitado ───────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_servicio_habilitado_combinacion\`
      ON \`servicio_habilitado\` (\`sede_id\`, \`servicio_catalogo_id\`, \`modalidad_id\`, \`complejidad_id\`, \`especificidad_id\`)
    `);

    // ─── CRÍTICA: autoevaluacion_item ──────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_autoevaluacion_item_criterio\`
      ON \`autoevaluacion_item\` (\`autoevaluacion_id\`, \`criterio_id\`)
    `);

    // ─── CRÍTICA: visita_resultado_item ────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_visita_resultado_criterio\`
      ON \`visita_resultado_item\` (\`visita_id\`, \`criterio_id\`)
    `);

    // ─── ALTA: criterio_aplicacion ─────────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_criterio_aplicacion_combinacion\`
      ON \`criterio_aplicacion\` (\`criterio_id\`, \`servicio_catalogo_id\`, \`modalidad_id\`, \`complejidad_id\`, \`especificidad_id\`)
    `);

    // ─── ALTA: criterio_version ────────────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_criterio_version\`
      ON \`criterio_version\` (\`criterio_id\`, \`version\`)
    `);

    // ─── ALTA: capacidad_instalada ─────────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_capacidad_instalada_servicio_tipo\`
      ON \`capacidad_instalada\` (\`servicio_habilitado_id\`, \`capacidad_tipo_id\`)
    `);

    // ─── ALTA: modalidad_servicio (cambiar índice existente a unique) ──
    await queryRunner.query(`
      DROP INDEX \`idx_modalidad_servicio_nombre\` ON \`modalidad_servicio\`
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`idx_modalidad_servicio_nombre\`
      ON \`modalidad_servicio\` (\`nombre\`)
    `);

    // ─── ALTA: especificidad_servicio ──────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_especificidad_servicio_codigo\`
      ON \`especificidad_servicio\` (\`servicio_catalogo_id\`, \`codigo\`)
    `);

    // ─── MEDIA: visita_participante ────────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_visita_participante_usuario\`
      ON \`visita_participante\` (\`visita_id\`, \`usuario_id\`)
    `);

    // ─── BAJA: plan_visitas.vigencia varchar(20) → smallint unsigned ───
    await queryRunner.query(`
      ALTER TABLE \`plan_visitas\`
      MODIFY COLUMN \`vigencia\` smallint UNSIGNED NOT NULL
    `);

    // ─── BAJA: capacidad_movimiento.cantidad int → int unsigned ────────
    await queryRunner.query(`
      ALTER TABLE \`capacidad_movimiento\`
      MODIFY COLUMN \`cantidad\` int UNSIGNED NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir tipos de dato
    await queryRunner.query(`
      ALTER TABLE \`capacidad_movimiento\`
      MODIFY COLUMN \`cantidad\` int NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`plan_visitas\`
      MODIFY COLUMN \`vigencia\` varchar(20) NOT NULL
    `);

    // Revertir índices únicos
    await queryRunner.query(`
      DROP INDEX \`uq_visita_participante_usuario\` ON \`visita_participante\`
    `);

    await queryRunner.query(`
      DROP INDEX \`uq_especificidad_servicio_codigo\` ON \`especificidad_servicio\`
    `);

    await queryRunner.query(`
      DROP INDEX \`idx_modalidad_servicio_nombre\` ON \`modalidad_servicio\`
    `);
    await queryRunner.query(`
      CREATE INDEX \`idx_modalidad_servicio_nombre\`
      ON \`modalidad_servicio\` (\`nombre\`)
    `);

    await queryRunner.query(`
      DROP INDEX \`uq_capacidad_instalada_servicio_tipo\` ON \`capacidad_instalada\`
    `);

    await queryRunner.query(`
      DROP INDEX \`uq_criterio_version\` ON \`criterio_version\`
    `);

    await queryRunner.query(`
      DROP INDEX \`uq_criterio_aplicacion_combinacion\` ON \`criterio_aplicacion\`
    `);

    await queryRunner.query(`
      DROP INDEX \`uq_visita_resultado_criterio\` ON \`visita_resultado_item\`
    `);

    await queryRunner.query(`
      DROP INDEX \`uq_autoevaluacion_item_criterio\` ON \`autoevaluacion_item\`
    `);

    await queryRunner.query(`
      DROP INDEX \`uq_servicio_habilitado_combinacion\` ON \`servicio_habilitado\`
    `);
  }
}
