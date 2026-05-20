import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import { envFilePath } from './config/env.loader';
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
      load: [databaseConfig],
      envFilePath: [envFilePath],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CatalogoModule,
    PrestadorModule,
    CapacidadModule,
    EstandarModule,
    EvaluacionModule,
    PlanificacionModule,
    NovedadModule,
    CertificadoModule,
    MediaModule,
    UsuarioModule,
    PamecModule,
    FirmaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
