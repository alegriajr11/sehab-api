import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { seedConfigKey } from '../../config/seed.config';
import { RolEntity } from '../usuario/entities/rol.entity';
import { ROLES_SEED_DATA } from './data/roles.seed-data';

@Injectable()
export class RolesSeedService {
  private readonly logger = new Logger(RolesSeedService.name);

  constructor(
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crea los roles del catálogo maestro si aún no existen (por `nombre`).
   */
  async seedRoles(): Promise<{ created: number; skipped: number }> {
    const config = this.configService.get<{ rolesOnBoot: boolean }>(
      seedConfigKey,
    );

    if (config && !config.rolesOnBoot) {
      this.logger.log('Semilla de roles deshabilitada (SEED_ROLES_ON_BOOT=false).');
      return { created: 0, skipped: ROLES_SEED_DATA.length };
    }

    let created = 0;
    let skipped = 0;

    for (const definition of ROLES_SEED_DATA) {
      const exists = await this.rolRepository.exists({
        where: { nombre: definition.nombre },
      });

      if (exists) {
        skipped++;
        continue;
      }

      const rol = this.rolRepository.create({
        nombre: definition.nombre,
        descripcion: definition.descripcion,
        activo: definition.activo,
      });

      await this.rolRepository.save(rol);
      created++;
      this.logger.log(`Rol creado: ${definition.nombre}`);
    }

    this.logger.log(
      `Semilla de roles finalizada — creados: ${created}, omitidos (ya existían): ${skipped}.`,
    );

    return { created, skipped };
  }
}
