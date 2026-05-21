import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seed: roles del sistema y usuario ADMIN inicial.
 * Credenciales por defecto: admin@sehab.gov.co / Admin123!
 * Cambiar la contraseña en producción.
 */
export class SeedRolesAndAdmin1779298100000 implements MigrationInterface {
  name = 'SeedRolesAndAdmin1779298100000';

  /** bcrypt("Admin123!", 12) */
  private readonly adminPasswordHash =
    '$2b$12$jY/ph1YknXpW725O6xo4beLJykvFJghTCMDTCNcLO6er0BjyenfKq';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const roles: [string, string][] = [
      ['ADMIN', 'Acceso total al sistema'],
      ['RES', 'Módulo Resolución 3100'],
      ['PAMEC', 'Programa PAMEC'],
      ['SP', 'Seguridad del Paciente'],
      ['SIC', 'Sistema de Información para la Calidad'],
    ];

    for (const [nombre, descripcion] of roles) {
      await queryRunner.query(
        `INSERT IGNORE INTO \`rol\` (\`nombre\`, \`descripcion\`, \`activo\`) VALUES (?, ?, 1)`,
        [nombre, descripcion],
      );
    }

    const adminRows: { id: string }[] = await queryRunner.query(
      `SELECT id FROM \`rol\` WHERE nombre = 'ADMIN' LIMIT 1`,
    );
    const adminRolId = adminRows[0]?.id;
    if (!adminRolId) return;

    await queryRunner.query(
      `INSERT IGNORE INTO \`usuario\` (
        \`nombre\`, \`email\`, \`password_hash\`, \`activo\`, \`rol_id\`, \`created_at\`, \`updated_at\`
      ) VALUES (?, ?, ?, 1, ?, NOW(6), NOW(6))`,
      [
        'Administrador SEHAB',
        'admin@sehab.gov.co',
        this.adminPasswordHash,
        adminRolId,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM \`usuario\` WHERE email = 'admin@sehab.gov.co'`,
    );
    await queryRunner.query(
      `DELETE FROM \`rol\` WHERE nombre IN ('ADMIN','RES','PAMEC','SP','SIC')`,
    );
  }
}
