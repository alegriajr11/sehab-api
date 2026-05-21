import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { AuditoriaEntity } from '../usuario/entities/auditoria.entity';

export interface AuditoriaLogParams {
  usuarioId: number | null;
  accion: AuditoriaAccionEnum;
  tablaAfectada: string;
  registroId: number | null;
  detalles?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(AuditoriaEntity)
    private readonly auditoriaRepository: Repository<AuditoriaEntity>,
  ) {}

  async log(
    params: AuditoriaLogParams,
    manager?: EntityManager,
  ): Promise<AuditoriaEntity> {
    const repo = manager
      ? manager.getRepository(AuditoriaEntity)
      : this.auditoriaRepository;

    const entry = repo.create({
      usuarioId: params.usuarioId,
      accion: params.accion,
      tablaAfectada: params.tablaAfectada,
      registroId: params.registroId,
      detalles: params.detalles ?? null,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    });

    const saved = await repo.save(entry);
    this.logger.debug(
      `Auditoría ${params.accion} en ${params.tablaAfectada}#${params.registroId}`,
    );
    return saved;
  }
}
