import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial SEHAB — Resolución 3100 de 2019 (bloques A–L).
 * Generado para MySQL 8+ / utf8mb4.
 *
 * Para regenerar desde entidades con DB conectada:
 *   npm run migration:generate -- src/database/migrations/NombreMigracion
 */
export class InitialSchemaRes31001779297344891 implements MigrationInterface {
  name = 'InitialSchemaRes31001779297344891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET NAMES utf8mb4`);
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`);

    // Bloque A — Catálogos
    await queryRunner.query(`
      CREATE TABLE \`departamento\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`nombre\` varchar(150) NOT NULL,
        \`codigo_dane\` varchar(5) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_departamento_codigo_dane\` (\`codigo_dane\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`municipio\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`departamento_id\` bigint UNSIGNED NOT NULL,
        \`nombre\` varchar(150) NOT NULL,
        \`codigo_dane\` varchar(8) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_municipio_departamento\` (\`departamento_id\`),
        UNIQUE INDEX \`idx_municipio_codigo_dane\` (\`codigo_dane\`),
        CONSTRAINT \`FK_municipio_departamento\` FOREIGN KEY (\`departamento_id\`) REFERENCES \`departamento\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`grupo_servicio\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(20) NOT NULL,
        \`nombre\` varchar(255) NOT NULL,
        \`descripcion\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_grupo_servicio_codigo\` (\`codigo\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`modalidad_servicio\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`nombre\` varchar(150) NOT NULL,
        \`descripcion\` text NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_modalidad_servicio_nombre\` (\`nombre\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`complejidad\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`nivel\` varchar(50) NOT NULL,
        \`descripcion\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_complejidad_nivel\` (\`nivel\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`servicio_catalogo\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`grupo_servicio_id\` bigint UNSIGNED NOT NULL,
        \`codigo_reps\` varchar(30) NOT NULL,
        \`nombre\` varchar(255) NOT NULL,
        \`descripcion\` text NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_servicio_catalogo_grupo\` (\`grupo_servicio_id\`),
        UNIQUE INDEX \`idx_servicio_catalogo_codigo_reps\` (\`codigo_reps\`),
        CONSTRAINT \`FK_servicio_catalogo_grupo\` FOREIGN KEY (\`grupo_servicio_id\`) REFERENCES \`grupo_servicio\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`especificidad_servicio\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`servicio_catalogo_id\` bigint UNSIGNED NOT NULL,
        \`codigo\` varchar(30) NOT NULL,
        \`nombre\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_especificidad_servicio_catalogo\` (\`servicio_catalogo_id\`),
        INDEX \`idx_especificidad_servicio_codigo\` (\`codigo\`),
        CONSTRAINT \`FK_especificidad_servicio_catalogo\` FOREIGN KEY (\`servicio_catalogo_id\`) REFERENCES \`servicio_catalogo\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque J (parcial) — Rol antes de usuario
    await queryRunner.query(`
      CREATE TABLE \`rol\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`nombre\` varchar(100) NOT NULL,
        \`descripcion\` text NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_rol_nombre\` (\`nombre\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque D — Estándares
    await queryRunner.query(`
      CREATE TABLE \`estandar\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(30) NOT NULL,
        \`nombre\` varchar(255) NOT NULL,
        \`descripcion\` text NULL,
        \`modulo\` varchar(80) NOT NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_estandar_codigo\` (\`codigo\`),
        INDEX \`idx_estandar_modulo\` (\`modulo\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`criterio\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(30) NOT NULL,
        \`titulo\` varchar(500) NOT NULL,
        \`descripcion\` text NULL,
        \`estandar_id\` bigint UNSIGNED NOT NULL,
        \`categoria\` varchar(80) NULL,
        \`nivel_complejidad\` varchar(50) NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_criterio_codigo\` (\`codigo\`),
        INDEX \`idx_criterio_estandar\` (\`estandar_id\`),
        INDEX \`idx_criterio_categoria\` (\`categoria\`),
        CONSTRAINT \`FK_criterio_estandar\` FOREIGN KEY (\`estandar_id\`) REFERENCES \`estandar\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`criterio_version\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`criterio_id\` bigint UNSIGNED NOT NULL,
        \`version\` varchar(20) NOT NULL,
        \`texto\` text NOT NULL,
        \`fecha_vigencia_desde\` date NOT NULL,
        \`fecha_vigencia_hasta\` date NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_criterio_version_criterio\` (\`criterio_id\`),
        INDEX \`idx_criterio_version_vigencia\` (\`fecha_vigencia_desde\`, \`fecha_vigencia_hasta\`),
        CONSTRAINT \`FK_criterio_version_criterio\` FOREIGN KEY (\`criterio_id\`) REFERENCES \`criterio\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`criterio_aplicacion\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`criterio_id\` bigint UNSIGNED NOT NULL,
        \`servicio_catalogo_id\` bigint UNSIGNED NULL,
        \`modalidad_id\` bigint UNSIGNED NULL,
        \`complejidad_id\` bigint UNSIGNED NULL,
        \`especificidad_id\` bigint UNSIGNED NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_criterio_aplicacion_criterio\` (\`criterio_id\`),
        INDEX \`idx_criterio_aplicacion_servicio\` (\`servicio_catalogo_id\`),
        CONSTRAINT \`FK_criterio_aplicacion_criterio\` FOREIGN KEY (\`criterio_id\`) REFERENCES \`criterio\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_criterio_aplicacion_servicio\` FOREIGN KEY (\`servicio_catalogo_id\`) REFERENCES \`servicio_catalogo\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_criterio_aplicacion_modalidad\` FOREIGN KEY (\`modalidad_id\`) REFERENCES \`modalidad_servicio\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_criterio_aplicacion_complejidad\` FOREIGN KEY (\`complejidad_id\`) REFERENCES \`complejidad\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_criterio_aplicacion_especificidad\` FOREIGN KEY (\`especificidad_id\`) REFERENCES \`especificidad_servicio\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque B — Prestadores
    await queryRunner.query(`
      CREATE TABLE \`prestador\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`nit\` varchar(20) NOT NULL,
        \`nombre_razon_social\` varchar(300) NOT NULL,
        \`reps_codigo\` varchar(30) NULL,
        \`estado\` enum('ACTIVO','INACTIVO','SUSPENDIDO','EN_TRAMITE') NOT NULL DEFAULT 'ACTIVO',
        \`vigencia_desde\` date NULL,
        \`vigencia_hasta\` date NULL,
        \`direccion\` varchar(500) NULL,
        \`telefono\` varchar(30) NULL,
        \`email\` varchar(150) NULL,
        \`municipio_id\` bigint UNSIGNED NOT NULL,
        \`metadata\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_prestador_nit\` (\`nit\`),
        INDEX \`idx_prestador_reps_codigo\` (\`reps_codigo\`),
        INDEX \`idx_prestador_municipio\` (\`municipio_id\`),
        INDEX \`idx_prestador_estado\` (\`estado\`),
        CONSTRAINT \`FK_prestador_municipio\` FOREIGN KEY (\`municipio_id\`) REFERENCES \`municipio\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`sede\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`prestador_id\` bigint UNSIGNED NOT NULL,
        \`nombre\` varchar(255) NOT NULL,
        \`direccion\` varchar(500) NULL,
        \`telefono\` varchar(30) NULL,
        \`email\` varchar(150) NULL,
        \`principal\` tinyint NOT NULL DEFAULT 0,
        \`municipio_id\` bigint UNSIGNED NOT NULL,
        \`estado\` enum('ACTIVO','INACTIVO','SUSPENDIDO','EN_TRAMITE') NOT NULL DEFAULT 'ACTIVO',
        \`reps_sede_codigo\` varchar(30) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_sede_prestador\` (\`prestador_id\`),
        INDEX \`idx_sede_municipio\` (\`municipio_id\`),
        INDEX \`idx_sede_reps_codigo\` (\`reps_sede_codigo\`),
        CONSTRAINT \`FK_sede_prestador\` FOREIGN KEY (\`prestador_id\`) REFERENCES \`prestador\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_sede_municipio\` FOREIGN KEY (\`municipio_id\`) REFERENCES \`municipio\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`servicio_habilitado\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`sede_id\` bigint UNSIGNED NOT NULL,
        \`servicio_catalogo_id\` bigint UNSIGNED NOT NULL,
        \`modalidad_id\` bigint UNSIGNED NOT NULL,
        \`complejidad_id\` bigint UNSIGNED NOT NULL,
        \`especificidad_id\` bigint UNSIGNED NULL,
        \`codigo_habilitacion\` varchar(50) NOT NULL,
        \`fecha_habilitacion\` date NULL,
        \`estado\` enum('HABILITADO','DESHABILITADO','EN_TRAMITE','SUSPENDIDO') NOT NULL DEFAULT 'HABILITADO',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_servicio_habilitado_sede\` (\`sede_id\`),
        INDEX \`idx_servicio_habilitado_catalogo\` (\`servicio_catalogo_id\`),
        INDEX \`idx_servicio_habilitado_codigo\` (\`codigo_habilitacion\`),
        INDEX \`idx_servicio_habilitado_estado\` (\`estado\`),
        CONSTRAINT \`FK_servicio_habilitado_sede\` FOREIGN KEY (\`sede_id\`) REFERENCES \`sede\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_servicio_habilitado_catalogo\` FOREIGN KEY (\`servicio_catalogo_id\`) REFERENCES \`servicio_catalogo\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_servicio_habilitado_modalidad\` FOREIGN KEY (\`modalidad_id\`) REFERENCES \`modalidad_servicio\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_servicio_habilitado_complejidad\` FOREIGN KEY (\`complejidad_id\`) REFERENCES \`complejidad\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_servicio_habilitado_especificidad\` FOREIGN KEY (\`especificidad_id\`) REFERENCES \`especificidad_servicio\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque C — Capacidad
    await queryRunner.query(`
      CREATE TABLE \`capacidad_tipo\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`codigo\` varchar(30) NOT NULL,
        \`nombre\` varchar(150) NOT NULL,
        \`descripcion\` text NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_capacidad_tipo_codigo\` (\`codigo\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`capacidad_instalada\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`prestador_id\` bigint UNSIGNED NOT NULL,
        \`sede_id\` bigint UNSIGNED NOT NULL,
        \`servicio_habilitado_id\` bigint UNSIGNED NOT NULL,
        \`capacidad_tipo_id\` bigint UNSIGNED NOT NULL,
        \`cantidad\` int UNSIGNED NOT NULL DEFAULT 0,
        \`detalle\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_capacidad_instalada_prestador\` (\`prestador_id\`),
        INDEX \`idx_capacidad_instalada_sede\` (\`sede_id\`),
        INDEX \`idx_capacidad_instalada_servicio\` (\`servicio_habilitado_id\`),
        CONSTRAINT \`FK_capacidad_instalada_prestador\` FOREIGN KEY (\`prestador_id\`) REFERENCES \`prestador\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_capacidad_instalada_sede\` FOREIGN KEY (\`sede_id\`) REFERENCES \`sede\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_capacidad_instalada_servicio\` FOREIGN KEY (\`servicio_habilitado_id\`) REFERENCES \`servicio_habilitado\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_capacidad_instalada_tipo\` FOREIGN KEY (\`capacidad_tipo_id\`) REFERENCES \`capacidad_tipo\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`capacidad_movimiento\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`capacidad_instalada_id\` bigint UNSIGNED NOT NULL,
        \`movimiento\` enum('INCREMENTO','DECREMENTO','AJUSTE') NOT NULL,
        \`cantidad\` int NOT NULL,
        \`fecha_movimiento\` datetime NOT NULL,
        \`motivo\` varchar(500) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_capacidad_movimiento_capacidad\` (\`capacidad_instalada_id\`),
        INDEX \`idx_capacidad_movimiento_fecha\` (\`fecha_movimiento\`),
        CONSTRAINT \`FK_capacidad_movimiento_capacidad\` FOREIGN KEY (\`capacidad_instalada_id\`) REFERENCES \`capacidad_instalada\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque J — Usuario
    await queryRunner.query(`
      CREATE TABLE \`usuario\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`nombre\` varchar(150) NOT NULL,
        \`email\` varchar(150) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        \`telefono\` varchar(30) NULL,
        \`rol_id\` bigint UNSIGNED NOT NULL,
        \`firma_digital_url\` varchar(500) NULL,
        \`ultimo_login\` datetime NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_usuario_email\` (\`email\`),
        INDEX \`idx_usuario_rol\` (\`rol_id\`),
        INDEX \`idx_usuario_activo\` (\`activo\`),
        CONSTRAINT \`FK_usuario_rol\` FOREIGN KEY (\`rol_id\`) REFERENCES \`rol\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque L — Firma digital
    await queryRunner.query(`
      CREATE TABLE \`firma_digital\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`usuario_id\` bigint UNSIGNED NOT NULL,
        \`firma_certificado\` text NULL,
        \`firma_url\` varchar(500) NOT NULL,
        \`creada_en\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`idx_firma_digital_usuario\` (\`usuario_id\`),
        CONSTRAINT \`FK_firma_digital_usuario\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque E — Autoevaluación y visitas
    await queryRunner.query(`
      CREATE TABLE \`autoevaluacion\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`prestador_id\` bigint UNSIGNED NOT NULL,
        \`sede_id\` bigint UNSIGNED NOT NULL,
        \`servicio_habilitado_id\` bigint UNSIGNED NOT NULL,
        \`creado_por_id\` bigint UNSIGNED NULL,
        \`periodo_inicio\` date NOT NULL,
        \`periodo_fin\` date NOT NULL,
        \`fecha_realizacion\` datetime NULL,
        \`declarada_en_reps\` tinyint NOT NULL DEFAULT 0,
        \`estado\` enum('BORRADOR','ENVIADA','DECLARADA_REPS','CERRADA') NOT NULL DEFAULT 'BORRADOR',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_autoevaluacion_prestador\` (\`prestador_id\`),
        INDEX \`idx_autoevaluacion_sede\` (\`sede_id\`),
        INDEX \`idx_autoevaluacion_servicio\` (\`servicio_habilitado_id\`),
        INDEX \`idx_autoevaluacion_periodo\` (\`periodo_inicio\`, \`periodo_fin\`),
        INDEX \`idx_autoevaluacion_estado\` (\`estado\`),
        CONSTRAINT \`FK_autoevaluacion_prestador\` FOREIGN KEY (\`prestador_id\`) REFERENCES \`prestador\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_autoevaluacion_sede\` FOREIGN KEY (\`sede_id\`) REFERENCES \`sede\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_autoevaluacion_servicio\` FOREIGN KEY (\`servicio_habilitado_id\`) REFERENCES \`servicio_habilitado\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_autoevaluacion_creado_por\` FOREIGN KEY (\`creado_por_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`autoevaluacion_item\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`autoevaluacion_id\` bigint UNSIGNED NOT NULL,
        \`criterio_id\` bigint UNSIGNED NOT NULL,
        \`criterio_version_id\` bigint UNSIGNED NOT NULL,
        \`cumple\` enum('CUMPLE','NO_CUMPLE','NO_APLICA','PARCIAL') NOT NULL,
        \`observaciones\` text NULL,
        \`puntos\` decimal(8,2) NULL,
        \`evidencia_url\` varchar(500) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_autoevaluacion_item_autoevaluacion\` (\`autoevaluacion_id\`),
        INDEX \`idx_autoevaluacion_item_criterio\` (\`criterio_id\`),
        CONSTRAINT \`FK_autoevaluacion_item_autoevaluacion\` FOREIGN KEY (\`autoevaluacion_id\`) REFERENCES \`autoevaluacion\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_autoevaluacion_item_criterio\` FOREIGN KEY (\`criterio_id\`) REFERENCES \`criterio\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_autoevaluacion_item_criterio_version\` FOREIGN KEY (\`criterio_version_id\`) REFERENCES \`criterio_version\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`visita\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`prestador_id\` bigint UNSIGNED NOT NULL,
        \`sede_id\` bigint UNSIGNED NULL,
        \`servicio_habilitado_id\` bigint UNSIGNED NULL,
        \`creada_por_id\` bigint UNSIGNED NULL,
        \`tipo_visita\` enum('INICIAL','SEGUIMIENTO','VERIFICACION','INSTITUCIONAL','EXTRAORDINARIA') NOT NULL,
        \`fecha_programada\` datetime NULL,
        \`fecha_inicio\` datetime NULL,
        \`fecha_fin\` datetime NULL,
        \`estado\` enum('PROGRAMADA','EN_CURSO','FINALIZADA','CANCELADA','REPROGRAMADA') NOT NULL DEFAULT 'PROGRAMADA',
        \`resultado_global\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_visita_prestador\` (\`prestador_id\`),
        INDEX \`idx_visita_sede\` (\`sede_id\`),
        INDEX \`idx_visita_servicio\` (\`servicio_habilitado_id\`),
        INDEX \`idx_visita_fecha_programada\` (\`fecha_programada\`),
        INDEX \`idx_visita_estado\` (\`estado\`),
        CONSTRAINT \`FK_visita_prestador\` FOREIGN KEY (\`prestador_id\`) REFERENCES \`prestador\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_visita_sede\` FOREIGN KEY (\`sede_id\`) REFERENCES \`sede\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_visita_servicio\` FOREIGN KEY (\`servicio_habilitado_id\`) REFERENCES \`servicio_habilitado\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_visita_creada_por\` FOREIGN KEY (\`creada_por_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`visita_participante\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`visita_id\` bigint UNSIGNED NOT NULL,
        \`usuario_id\` bigint UNSIGNED NULL,
        \`nombre_externo\` varchar(255) NULL,
        \`rol\` varchar(80) NOT NULL,
        \`firma_url\` varchar(500) NULL,
        \`firmado\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_visita_participante_visita\` (\`visita_id\`),
        INDEX \`idx_visita_participante_usuario\` (\`usuario_id\`),
        CONSTRAINT \`FK_visita_participante_visita\` FOREIGN KEY (\`visita_id\`) REFERENCES \`visita\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_visita_participante_usuario\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`acta_visita\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`visita_id\` bigint UNSIGNED NOT NULL,
        \`numero_acta\` varchar(50) NOT NULL,
        \`fecha_emision\` datetime NULL,
        \`estado\` enum('BORRADOR','EMITIDA','FIRMADA','ANULADA') NOT NULL DEFAULT 'BORRADOR',
        \`documento_url\` varchar(500) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_acta_visita_visita\` (\`visita_id\`),
        UNIQUE INDEX \`idx_acta_visita_numero\` (\`numero_acta\`),
        CONSTRAINT \`FK_acta_visita_visita\` FOREIGN KEY (\`visita_id\`) REFERENCES \`visita\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`acta_firma\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`acta_id\` bigint UNSIGNED NOT NULL,
        \`usuario_id\` bigint UNSIGNED NULL,
        \`nombre_externo\` varchar(255) NULL,
        \`rol\` varchar(80) NOT NULL,
        \`firma_url\` varchar(500) NULL,
        \`fecha_firma\` datetime NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_acta_firma_acta\` (\`acta_id\`),
        INDEX \`idx_acta_firma_usuario\` (\`usuario_id\`),
        CONSTRAINT \`FK_acta_firma_acta\` FOREIGN KEY (\`acta_id\`) REFERENCES \`acta_visita\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_acta_firma_usuario\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`visita_resultado_item\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`visita_id\` bigint UNSIGNED NOT NULL,
        \`acta_id\` bigint UNSIGNED NULL,
        \`criterio_id\` bigint UNSIGNED NOT NULL,
        \`criterio_version_id\` bigint UNSIGNED NOT NULL,
        \`cumple\` enum('CUMPLE','NO_CUMPLE','NO_APLICA','PARCIAL') NOT NULL,
        \`calificacion\` decimal(8,2) NULL,
        \`observaciones\` text NULL,
        \`evidencia\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_visita_resultado_visita\` (\`visita_id\`),
        INDEX \`idx_visita_resultado_acta\` (\`acta_id\`),
        INDEX \`idx_visita_resultado_criterio\` (\`criterio_id\`),
        CONSTRAINT \`FK_visita_resultado_visita\` FOREIGN KEY (\`visita_id\`) REFERENCES \`visita\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_visita_resultado_acta\` FOREIGN KEY (\`acta_id\`) REFERENCES \`acta_visita\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_visita_resultado_criterio\` FOREIGN KEY (\`criterio_id\`) REFERENCES \`criterio\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_visita_resultado_criterio_version\` FOREIGN KEY (\`criterio_version_id\`) REFERENCES \`criterio_version\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque F — Planificación
    await queryRunner.query(`
      CREATE TABLE \`plan_visitas\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`entidad_territorial\` varchar(255) NOT NULL,
        \`vigencia\` varchar(20) NOT NULL,
        \`fecha_formulado\` date NULL,
        \`estado\` enum('BORRADOR','FORMULADO','APROBADO','VIGENTE','CERRADO') NOT NULL DEFAULT 'BORRADOR',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_plan_visitas_entidad\` (\`entidad_territorial\`),
        INDEX \`idx_plan_visitas_vigencia\` (\`vigencia\`),
        INDEX \`idx_plan_visitas_estado\` (\`estado\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`plan_visitas_detalle\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`plan_visitas_id\` bigint UNSIGNED NOT NULL,
        \`servicio_catalogo_id\` bigint UNSIGNED NOT NULL,
        \`prioridad\` int UNSIGNED NOT NULL DEFAULT 1,
        \`periodo_programacion\` varchar(50) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_plan_visitas_detalle_plan\` (\`plan_visitas_id\`),
        INDEX \`idx_plan_visitas_detalle_servicio\` (\`servicio_catalogo_id\`),
        CONSTRAINT \`FK_plan_visitas_detalle_plan\` FOREIGN KEY (\`plan_visitas_id\`) REFERENCES \`plan_visitas\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_plan_visitas_detalle_servicio\` FOREIGN KEY (\`servicio_catalogo_id\`) REFERENCES \`servicio_catalogo\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque G — Novedades
    await queryRunner.query(`
      CREATE TABLE \`novedad\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`prestador_id\` bigint UNSIGNED NOT NULL,
        \`sede_id\` bigint UNSIGNED NULL,
        \`servicio_habilitado_id\` bigint UNSIGNED NULL,
        \`capacidad_instalada_id\` bigint UNSIGNED NULL,
        \`tipo_novedad\` enum('CAMBIO_CAPACIDAD','CAMBIO_SERVICIO','CAMBIO_SEDE','CAMBIO_PRESTADOR','CIERRE','OTRO') NOT NULL,
        \`subtipo\` varchar(80) NULL,
        \`fecha_reporte\` datetime NOT NULL,
        \`estado\` enum('REPORTADA','EN_REVISION','APROBADA','RECHAZADA','CERRADA') NOT NULL DEFAULT 'REPORTADA',
        \`documento_soporte_url\` varchar(500) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_novedad_prestador\` (\`prestador_id\`),
        INDEX \`idx_novedad_fecha_reporte\` (\`fecha_reporte\`),
        INDEX \`idx_novedad_estado\` (\`estado\`),
        INDEX \`idx_novedad_tipo\` (\`tipo_novedad\`),
        CONSTRAINT \`FK_novedad_prestador\` FOREIGN KEY (\`prestador_id\`) REFERENCES \`prestador\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_novedad_sede\` FOREIGN KEY (\`sede_id\`) REFERENCES \`sede\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_novedad_servicio\` FOREIGN KEY (\`servicio_habilitado_id\`) REFERENCES \`servicio_habilitado\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_novedad_capacidad\` FOREIGN KEY (\`capacidad_instalada_id\`) REFERENCES \`capacidad_instalada\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque H — Certificados
    await queryRunner.query(`
      CREATE TABLE \`certificado_habilitacion\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`prestador_id\` bigint UNSIGNED NOT NULL,
        \`sede_id\` bigint UNSIGNED NULL,
        \`servicio_habilitado_id\` bigint UNSIGNED NULL,
        \`numero_certificado\` varchar(50) NOT NULL,
        \`fecha_emision\` datetime NOT NULL,
        \`fecha_vigencia_inicio\` date NOT NULL,
        \`fecha_vigencia_fin\` date NULL,
        \`documento_url\` varchar(500) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_certificado_prestador\` (\`prestador_id\`),
        UNIQUE INDEX \`idx_certificado_numero\` (\`numero_certificado\`),
        INDEX \`idx_certificado_vigencia\` (\`fecha_vigencia_inicio\`, \`fecha_vigencia_fin\`),
        CONSTRAINT \`FK_certificado_prestador\` FOREIGN KEY (\`prestador_id\`) REFERENCES \`prestador\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_certificado_sede\` FOREIGN KEY (\`sede_id\`) REFERENCES \`sede\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_certificado_servicio\` FOREIGN KEY (\`servicio_habilitado_id\`) REFERENCES \`servicio_habilitado\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`distintivo_habilitacion\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`prestador_id\` bigint UNSIGNED NOT NULL,
        \`sede_id\` bigint UNSIGNED NULL,
        \`servicio_habilitado_id\` bigint UNSIGNED NULL,
        \`codigo_distintivo\` varchar(50) NOT NULL,
        \`fecha_generacion\` datetime NOT NULL,
        \`valido_hasta\` date NULL,
        \`url_imagen\` varchar(500) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_distintivo_prestador\` (\`prestador_id\`),
        UNIQUE INDEX \`idx_distintivo_codigo\` (\`codigo_distintivo\`),
        CONSTRAINT \`FK_distintivo_prestador\` FOREIGN KEY (\`prestador_id\`) REFERENCES \`prestador\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_distintivo_sede\` FOREIGN KEY (\`sede_id\`) REFERENCES \`sede\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_distintivo_servicio\` FOREIGN KEY (\`servicio_habilitado_id\`) REFERENCES \`servicio_habilitado\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque I — Media (Cloudinary URLs)
    await queryRunner.query(`
      CREATE TABLE \`media\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`owner_type\` enum('PRESTADOR','SEDE','SERVICIO_HABILITADO','VISITA','ACTA_VISITA','AUTOEVALUACION','NOVEDAD','CERTIFICADO','DISTINTIVO','CRITERIO','USUARIO','OTRO') NOT NULL,
        \`owner_id\` bigint UNSIGNED NOT NULL,
        \`url\` varchar(500) NOT NULL,
        \`filename\` varchar(255) NOT NULL,
        \`mime_type\` varchar(120) NOT NULL,
        \`size\` bigint UNSIGNED NOT NULL DEFAULT 0,
        \`checksum\` varchar(64) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_media_owner\` (\`owner_type\`, \`owner_id\`),
        INDEX \`idx_media_checksum\` (\`checksum\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque J — Auditoría
    await queryRunner.query(`
      CREATE TABLE \`auditoria\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`usuario_id\` bigint UNSIGNED NULL,
        \`accion\` varchar(50) NOT NULL,
        \`tabla_afectada\` varchar(100) NOT NULL,
        \`registro_id\` bigint UNSIGNED NULL,
        \`detalles\` json NULL,
        \`ip\` varchar(45) NULL,
        \`user_agent\` varchar(500) NULL,
        \`fecha\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_auditoria_usuario\` (\`usuario_id\`),
        INDEX \`idx_auditoria_tabla_registro\` (\`tabla_afectada\`, \`registro_id\`),
        INDEX \`idx_auditoria_fecha\` (\`fecha\`),
        CONSTRAINT \`FK_auditoria_usuario\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Bloque K — PAMEC
    await queryRunner.query(`
      CREATE TABLE \`actividad\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`nombre\` varchar(255) NOT NULL,
        \`descripcion\` text NULL,
        \`modulo\` varchar(80) NOT NULL,
        \`activo\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_actividad_modulo\` (\`modulo\`),
        INDEX \`idx_actividad_nombre\` (\`nombre\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE \`actividad_criterio\` (
        \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        \`actividad_id\` bigint UNSIGNED NOT NULL,
        \`criterio_id\` bigint UNSIGNED NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_actividad_criterio_actividad\` (\`actividad_id\`),
        INDEX \`idx_actividad_criterio_criterio\` (\`criterio_id\`),
        UNIQUE INDEX \`uq_actividad_criterio\` (\`actividad_id\`, \`criterio_id\`),
        CONSTRAINT \`FK_actividad_criterio_actividad\` FOREIGN KEY (\`actividad_id\`) REFERENCES \`actividad\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_actividad_criterio_criterio\` FOREIGN KEY (\`criterio_id\`) REFERENCES \`criterio\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`);

    const tables = [
      'actividad_criterio',
      'actividad',
      'auditoria',
      'media',
      'distintivo_habilitacion',
      'certificado_habilitacion',
      'novedad',
      'plan_visitas_detalle',
      'plan_visitas',
      'visita_resultado_item',
      'acta_firma',
      'acta_visita',
      'visita_participante',
      'visita',
      'autoevaluacion_item',
      'autoevaluacion',
      'firma_digital',
      'usuario',
      'capacidad_movimiento',
      'capacidad_instalada',
      'capacidad_tipo',
      'servicio_habilitado',
      'sede',
      'prestador',
      'criterio_aplicacion',
      'criterio_version',
      'criterio',
      'estandar',
      'rol',
      'especificidad_servicio',
      'servicio_catalogo',
      'complejidad',
      'modalidad_servicio',
      'grupo_servicio',
      'municipio',
      'departamento',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS \`${table}\``);
    }

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`);
  }
}
