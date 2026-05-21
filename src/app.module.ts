import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import seedConfig from './config/seed.config';
import { envFilePath } from './config/env.loader';
import { DatabaseModule } from './database/database.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedModule } from './modules/seed/seed.module';
import {
  CapacidadModule,
  CatalogoModule,
  CertificadoModule,
  EstandarModule,
  EvaluacionModule,
  FirmaModule,
  MediaModule,
  NovedadModule,
  PamecModule,
  PlanificacionModule,
  PrestadorModule,
  UsuarioModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, seedConfig],
      envFilePath: [envFilePath],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    SeedModule,
    AuditoriaModule,
    AuthModule,
    CatalogoModule,
    UsuarioModule,
    PrestadorModule,
    CapacidadModule,
    EstandarModule,
    EvaluacionModule,
    PlanificacionModule,
    NovedadModule,
    CertificadoModule,
    MediaModule,
    PamecModule,
    FirmaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
