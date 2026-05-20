import { config } from 'dotenv';
import { resolve } from 'path';

export const envFilePath = resolve(process.cwd(), '.env');

/**
 * Carga variables desde .env (CLI TypeORM, scripts fuera de Nest).
 * Idempotente: llamar más de una vez no sobrescribe valores ya definidos.
 */
export function loadEnvFile(): void {
  config({ path: envFilePath });
}
