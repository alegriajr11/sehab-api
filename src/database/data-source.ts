import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  createDatabaseOptions,
  databaseConfigKey,
} from '../config/database.config';
import { loadEnvFile } from '../config/env.loader';
import { sehabEntities } from './entities';

loadEnvFile();

const configService = new ConfigService({
  [databaseConfigKey]: createDatabaseOptions(),
});

const databaseConfig =
  configService.get<TypeOrmModuleOptions>(databaseConfigKey)!;

/** Rutas de migración relativas a este archivo (CLI TypeORM). */
export default new DataSource({
  ...(databaseConfig as DataSourceOptions),
  entities: sehabEntities,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
});
