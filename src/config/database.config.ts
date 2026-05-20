import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { sehabEntities } from '../database/entities';

export const databaseConfigKey = 'database';

const migrationsGlob = `${__dirname}/../database/migrations/*{.ts,.js}`;

/**
 * Opciones TypeORM derivadas de variables de entorno.
 * Fuente única para Nest (ConfigModule) y CLI (data-source.ts).
 */
export function createDatabaseOptions(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'sehab',
    entities: sehabEntities,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    migrations: [migrationsGlob],
    migrationsTableName: 'typeorm_migrations',
    charset: 'utf8mb4',
    timezone: 'Z',
  };
}

export default registerAs(databaseConfigKey, createDatabaseOptions);
