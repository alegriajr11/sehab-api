import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AdminUserSeedService } from './admin-user-seed.service';
import { RolesSeedService } from './roles-seed.service';

/**
 * Orquesta las semillas de arranque en orden: roles → usuario ADMIN.
 */
@Injectable()
export class AppSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppSeedService.name);

  constructor(
    private readonly rolesSeedService: RolesSeedService,
    private readonly adminUserSeedService: AdminUserSeedService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Iniciando semillas de arranque...');
    await this.rolesSeedService.seedRoles();
    await this.adminUserSeedService.seedAdminUser();
    this.logger.log('Semillas de arranque completadas.');
  }
}
