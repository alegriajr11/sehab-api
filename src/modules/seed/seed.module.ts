import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import seedConfig from '../../config/seed.config';
import { RolEntity } from '../usuario/entities/rol.entity';
import { UsuarioEntity } from '../usuario/entities/usuario.entity';
import { AdminUserSeedService } from './admin-user-seed.service';
import { AppSeedService } from './app-seed.service';
import { RolesSeedService } from './roles-seed.service';

@Module({
  imports: [
    ConfigModule.forFeature(seedConfig),
    TypeOrmModule.forFeature([RolEntity, UsuarioEntity]),
  ],
  providers: [RolesSeedService, AdminUserSeedService, AppSeedService],
  exports: [RolesSeedService, AdminUserSeedService, AppSeedService],
})
export class SeedModule {}
