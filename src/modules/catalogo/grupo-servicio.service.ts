import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { normalizeCatalogCode } from '../../common/utils/catalog-code.util';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateGrupoServicioDto } from './dto/grupo-servicio/create-grupo-servicio.dto';
import { UpdateGrupoServicioDto } from './dto/grupo-servicio/update-grupo-servicio.dto';
import { GrupoServicioEntity } from './entities/grupo-servicio.entity';
import { ServicioCatalogoEntity } from './entities/servicio-catalogo.entity';

@Injectable()
export class GrupoServicioService {
  constructor(
    @InjectRepository(GrupoServicioEntity)
    private readonly grupoRepository: Repository<GrupoServicioEntity>,
    @InjectRepository(ServicioCatalogoEntity)
    private readonly servicioRepository: Repository<ServicioCatalogoEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.grupoRepository.createQueryBuilder('g');
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(g.nombre LIKE :term OR g.codigo LIKE :term)', { term });
    }
    qb.orderBy('g.nombre', 'ASC').skip((page - 1) * size).take(size);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number) {
    const entity = await this.grupoRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Grupo de servicio no encontrado.' });
    }
    return entity;
  }

  async create(dto: CreateGrupoServicioDto, user: AuthenticatedUser, meta: RequestMeta) {
    const codigo = normalizeCatalogCode(dto.codigo);
    await this.assertCodigoUnique(codigo);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(GrupoServicioEntity);
      const saved = await repo.save(
        repo.create({ codigo, nombre: dto.nombre, descripcion: dto.descripcion ?? null }),
      );
      await this.audit(manager, user, meta, AuditoriaAccionEnum.CREATE, saved.id, { after: saved });
      return saved;
    });
  }

  async update(id: number, dto: UpdateGrupoServicioDto, user: AuthenticatedUser, meta: RequestMeta) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(GrupoServicioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Grupo de servicio no encontrado.' });
      const before = { ...entity };
      if (dto.codigo !== undefined) {
        const codigo = normalizeCatalogCode(dto.codigo);
        if (codigo !== entity.codigo) await this.assertCodigoUnique(codigo, id);
        entity.codigo = codigo;
      }
      if (dto.nombre !== undefined) entity.nombre = dto.nombre;
      if (dto.descripcion !== undefined) entity.descripcion = dto.descripcion ?? null;
      const saved = await repo.save(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.UPDATE, saved.id, { before, after: saved });
      return saved;
    });
  }

  async remove(id: number, user: AuthenticatedUser, meta: RequestMeta) {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(GrupoServicioEntity);
      const servicioRepo = manager.getRepository(ServicioCatalogoEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Grupo de servicio no encontrado.' });
      const inUse = await servicioRepo.exists({ where: { grupoServicioId: id } });
      if (inUse) {
        throw new BusinessException(
          'SERVICE_IN_USE',
          'El grupo tiene servicios asociados y no puede eliminarse.',
          409,
        );
      }
      const before = { ...entity };
      await repo.remove(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.DELETE, id, { before });
    });
  }

  private async assertCodigoUnique(codigo: string, excludeId?: number) {
    const existing = await this.grupoRepository.findOne({ where: { codigo } });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException('GROUP_CODE_CONFLICT', 'El código de grupo ya existe.', 409);
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
        tablaAfectada: 'grupo_servicio',
        registroId,
        detalles,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
      manager,
    );
  }
}
