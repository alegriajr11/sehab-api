import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaEntity, RolEntity, UsuarioEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntity, UsuarioEntity, AuditoriaEntity])],
  exports: [TypeOrmModule],
})
export class UsuarioModule {}
