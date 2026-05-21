import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { normalizeCatalogCode } from '../../common/utils/catalog-code.util';
import { CriterioAplicacionEntity } from '../estandar/entities/criterio-aplicacion.entity';
import { PlanVisitasDetalleEntity } from '../planificacion/entities/plan-visitas-detalle.entity';
import { ServicioHabilitadoEntity } from '../prestador/entities/servicio-habilitado.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateServicioCatalogoDto } from './dto/servicio-catalogo/create-servicio-catalogo.dto';
import { ServicioCatalogoQueryDto } from './dto/servicio-catalogo/servicio-catalogo-query.dto';
import { UpdateServicioCatalogoDto } from './dto/servicio-catalogo/update-servicio-catalogo.dto';
import { GrupoServicioEntity } from './entities/grupo-servicio.entity';
import { ServicioCatalogoEntity } from './entities/servicio-catalogo.entity';

@Injectable()
export class ServicioCatalogoService {
  constructor(
    @InjectRepository(ServicioCatalogoEntity)
    private readonly servicioRepository: Repository<ServicioCatalogoEntity>,
    @InjectRepository(GrupoServicioEntity)
    private readonly grupoRepository: Repository<GrupoServicioEntity>,
    @InjectRepository(ServicioHabilitadoEntity)
    private readonly habilitadoRepository: Repository<ServicioHabilitadoEntity>,
    @InjectRepository(CriterioAplicacionEntity)
    private readonly criterioAplicacionRepository: Repository<CriterioAplicacionEntity>,
    @InjectRepository(PlanVisitasDetalleEntity)
    private readonly planDetalleRepository: Repository<PlanVisitasDetalleEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: ServicioCatalogoQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.servicioRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.grupoServicio', 'g');
    if (query.grupoId) qb.andWhere('s.grupoServicioId = :grupoId', { grupoId: query.grupoId });
    if (query.codigo_reps) {
      qb.andWhere('s.codigoReps = :codigoReps', {
        codigoReps: normalizeCatalogCode(query.codigo_reps),
      });
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(s.nombre LIKE :term OR s.codigoReps LIKE :term)', { term });
    }
    qb.orderBy('s.nombre', 'ASC').skip((page - 1) * size).take(size);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number) {
    const entity = await this.servicioRepository.findOne({
      where: { id },
      relations: { grupoServicio: true },
    });
    if (!entity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Servicio de catálogo no encontrado.' });
    }
    return entity;
  }

  async create(dto: CreateServicioCatalogoDto, user: AuthenticatedUser, meta: RequestMeta) {
    await this.assertGrupoExists(dto.grupo_servicio_id);
    const codigoReps = normalizeCatalogCode(dto.codigo_reps);
    await this.assertCodigoRepsUnique(codigoReps);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ServicioCatalogoEntity);
      const saved = await repo.save(
        repo.create({
          grupoServicioId: dto.grupo_servicio_id,
          codigoReps,
          nombre: dto.nombre,
          descripcion: dto.descripcion ?? null,
        }),
      );
      await this.audit(manager, user, meta, AuditoriaAccionEnum.CREATE, saved.id, { after: saved });
      return saved;
    });
  }

  async update(
    id: number,
    dto: UpdateServicioCatalogoDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ServicioCatalogoEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({ code: 'NOT_FOUND', message: 'Servicio de catálogo no encontrado.' });
      }
      const before = { ...entity };
      if (dto.grupo_servicio_id !== undefined) {
        await this.assertGrupoExists(dto.grupo_servicio_id);
        entity.grupoServicioId = dto.grupo_servicio_id;
      }
      if (dto.codigo_reps !== undefined) {
        const codigoReps = normalizeCatalogCode(dto.codigo_reps);
        if (codigoReps !== entity.codigoReps) await this.assertCodigoRepsUnique(codigoReps, id);
        entity.codigoReps = codigoReps;
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
      const repo = manager.getRepository(ServicioCatalogoEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({ code: 'NOT_FOUND', message: 'Servicio de catálogo no encontrado.' });
      }
      if (await this.isServicioInUse(id, manager)) {
        throw new BusinessException(
          'SERVICE_IN_USE',
          'El servicio está en uso y no puede eliminarse.',
          409,
        );
      }
      const before = { ...entity };
      await repo.remove(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.DELETE, id, { before });
    });
  }

  private async isServicioInUse(
    servicioCatalogoId: number,
    manager: DataSource['manager'],
  ): Promise<boolean> {
    const habilitadoRepo = manager.getRepository(ServicioHabilitadoEntity);
    const criterioRepo = manager.getRepository(CriterioAplicacionEntity);
    const planRepo = manager.getRepository(PlanVisitasDetalleEntity);

    if (await habilitadoRepo.exists({ where: { servicioCatalogoId } })) return true;
    if (await criterioRepo.exists({ where: { servicioCatalogoId } })) return true;
    if (await planRepo.exists({ where: { servicioCatalogoId } })) return true;
    return false;
  }

  private async assertGrupoExists(grupoId: number) {
    const exists = await this.grupoRepository.exists({ where: { id: grupoId } });
    if (!exists) {
      throw new BadRequestException({
        code: 'GROUP_NOT_FOUND',
        message: 'El grupo de servicio indicado no existe.',
      });
    }
  }

  private async assertCodigoRepsUnique(codigoReps: string, excludeId?: number) {
    const existing = await this.servicioRepository.findOne({ where: { codigoReps } });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException(
        'SERVICE_CODE_CONFLICT',
        'Código REPS ya existe para otro servicio.',
        409,
      );
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
        tablaAfectada: 'servicio_catalogo',
        registroId,
        detalles,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
      manager,
    );
  }
}
