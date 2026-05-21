import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CriterioAplicacionEntity } from '../estandar/entities/criterio-aplicacion.entity';
import { ServicioHabilitadoEntity } from '../prestador/entities/servicio-habilitado.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateComplejidadDto } from './dto/complejidad/create-complejidad.dto';
import { UpdateComplejidadDto } from './dto/complejidad/update-complejidad.dto';
import { ComplejidadEntity } from './entities/complejidad.entity';

@Injectable()
export class ComplejidadService {
  constructor(
    @InjectRepository(ComplejidadEntity)
    private readonly complejidadRepository: Repository<ComplejidadEntity>,
    @InjectRepository(ServicioHabilitadoEntity)
    private readonly habilitadoRepository: Repository<ServicioHabilitadoEntity>,
    @InjectRepository(CriterioAplicacionEntity)
    private readonly criterioAplicacionRepository: Repository<CriterioAplicacionEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.complejidadRepository.createQueryBuilder('c');
    if (query.search?.trim()) {
      qb.andWhere('(c.nivel LIKE :term OR c.descripcion LIKE :term)', {
        term: `%${query.search.trim()}%`,
      });
    }
    qb.orderBy('c.nivel', 'ASC').skip((page - 1) * size).take(size);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number) {
    const entity = await this.complejidadRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Complejidad no encontrada.' });
    }
    return entity;
  }

  async create(dto: CreateComplejidadDto, user: AuthenticatedUser, meta: RequestMeta) {
    await this.assertNivelUnique(dto.nivel);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ComplejidadEntity);
      const saved = await repo.save(
        repo.create({ nivel: dto.nivel, descripcion: dto.descripcion ?? null }),
      );
      await this.audit(manager, user, meta, AuditoriaAccionEnum.CREATE, saved.id, { after: saved });
      return saved;
    });
  }

  async update(id: number, dto: UpdateComplejidadDto, user: AuthenticatedUser, meta: RequestMeta) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ComplejidadEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Complejidad no encontrada.' });
      const before = { ...entity };
      if (dto.nivel !== undefined && dto.nivel !== entity.nivel) {
        await this.assertNivelUnique(dto.nivel, id);
        entity.nivel = dto.nivel;
      }
      if (dto.descripcion !== undefined) entity.descripcion = dto.descripcion ?? null;
      const saved = await repo.save(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.UPDATE, saved.id, { before, after: saved });
      return saved;
    });
  }

  async remove(id: number, user: AuthenticatedUser, meta: RequestMeta) {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ComplejidadEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Complejidad no encontrada.' });
      if (await this.isInUse(id, manager)) {
        throw new BusinessException(
          'SERVICE_IN_USE',
          'La complejidad está en uso y no puede eliminarse.',
          409,
        );
      }
      const before = { ...entity };
      await repo.remove(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.DELETE, id, { before });
    });
  }

  private async isInUse(complejidadId: number, manager: DataSource['manager']) {
    const habilitadoRepo = manager.getRepository(ServicioHabilitadoEntity);
    const criterioRepo = manager.getRepository(CriterioAplicacionEntity);
    if (await habilitadoRepo.exists({ where: { complejidadId } })) return true;
    if (await criterioRepo.exists({ where: { complejidadId } })) return true;
    return false;
  }

  private async assertNivelUnique(nivel: string, excludeId?: number) {
    const existing = await this.complejidadRepository.findOne({ where: { nivel } });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException('COMPLEXITY_LEVEL_CONFLICT', 'El nivel de complejidad ya existe.', 409);
    }
  }

  private audit(
    manager: DataSource['manager'],
    user: AuthenticatedUser,
    meta: RequestMeta,
    accion: AuditoriaAccionEnum,
    registroId: number,
    detalles: Record<string, unknown>,
  ) {
    return this.auditoriaService.log(
      {
        usuarioId: user.id,
        accion,
        tablaAfectada: 'complejidad',
        registroId,
        detalles,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
      manager,
    );
  }
}
