import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditoriaEntity } from './entities/auditoria.entity';
import { RolEntity } from './entities/rol.entity';
import { UsuarioEntity } from './entities/usuario.entity';
import { RolController } from './rol.controller';
import { RolService } from './rol.service';
import { UsuarioManagementController } from './usuario-management.controller';
import { UsuarioManagementService } from './usuario-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolEntity, UsuarioEntity, AuditoriaEntity]),
    AuthModule,
  ],
  controllers: [RolController, UsuarioManagementController],
  providers: [RolService, UsuarioManagementService],
  exports: [TypeOrmModule, RolService, UsuarioManagementService],
})
export class UsuarioModule {}
