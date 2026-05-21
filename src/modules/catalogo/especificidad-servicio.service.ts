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
import { ServicioHabilitadoEntity } from '../prestador/entities/servicio-habilitado.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateEspecificidadDto } from './dto/especificidad/create-especificidad.dto';
import { EspecificidadQueryDto } from './dto/especificidad/especificidad-query.dto';
import { UpdateEspecificidadDto } from './dto/especificidad/update-especificidad.dto';
import { EspecificidadServicioEntity } from './entities/especificidad-servicio.entity';
import { ServicioCatalogoEntity } from './entities/servicio-catalogo.entity';

@Injectable()
export class EspecificidadServicioService {
  constructor(
    @InjectRepository(EspecificidadServicioEntity)
    private readonly especificidadRepository: Repository<EspecificidadServicioEntity>,
    @InjectRepository(ServicioCatalogoEntity)
    private readonly servicioRepository: Repository<ServicioCatalogoEntity>,
    @InjectRepository(ServicioHabilitadoEntity)
    private readonly habilitadoRepository: Repository<ServicioHabilitadoEntity>,
    @InjectRepository(CriterioAplicacionEntity)
    private readonly criterioAplicacionRepository: Repository<CriterioAplicacionEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: EspecificidadQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.especificidadRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.servicioCatalogo', 's');
    if (query.servicioId) {
      qb.andWhere('e.servicioCatalogoId = :servicioId', { servicioId: query.servicioId });
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(e.nombre LIKE :term OR e.codigo LIKE :term)', { term });
    }
    qb.orderBy('e.nombre', 'ASC').skip((page - 1) * size).take(size);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number) {
    const entity = await this.especificidadRepository.findOne({
      where: { id },
      relations: { servicioCatalogo: true },
    });
    if (!entity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Especificidad no encontrada.' });
    }
    return entity;
  }

  async create(dto: CreateEspecificidadDto, user: AuthenticatedUser, meta: RequestMeta) {
    await this.assertServicioExists(dto.servicio_catalogo_id);
    const codigo = normalizeCatalogCode(dto.codigo);
    await this.assertCombinacionUnique(dto.servicio_catalogo_id, codigo);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(EspecificidadServicioEntity);
      const saved = await repo.save(
        repo.create({
          servicioCatalogoId: dto.servicio_catalogo_id,
          codigo,
          nombre: dto.nombre,
        }),
      );
      await this.audit(manager, user, meta, AuditoriaAccionEnum.CREATE, saved.id, { after: saved });
      return saved;
    });
  }

  async update(
    id: number,
    dto: UpdateEspecificidadDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(EspecificidadServicioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({ code: 'NOT_FOUND', message: 'Especificidad no encontrada.' });
      }
      const before = { ...entity };
      const servicioId = dto.servicio_catalogo_id ?? entity.servicioCatalogoId;
      if (dto.servicio_catalogo_id !== undefined) {
        await this.assertServicioExists(dto.servicio_catalogo_id);
        entity.servicioCatalogoId = dto.servicio_catalogo_id;
      }
      if (dto.codigo !== undefined) {
        const codigo = normalizeCatalogCode(dto.codigo);
        if (codigo !== entity.codigo || servicioId !== entity.servicioCatalogoId) {
          await this.assertCombinacionUnique(servicioId, codigo, id);
        }
        entity.codigo = codigo;
      }
      if (dto.nombre !== undefined) entity.nombre = dto.nombre;
      const saved = await repo.save(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.UPDATE, saved.id, { before, after: saved });
      return saved;
    });
  }

  async remove(id: number, user: AuthenticatedUser, meta: RequestMeta) {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(EspecificidadServicioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({ code: 'NOT_FOUND', message: 'Especificidad no encontrada.' });
      }
      if (await this.isInUse(id, manager)) {
        throw new BusinessException(
          'SERVICE_IN_USE',
          'La especificidad está en uso y no puede eliminarse.',
          409,
        );
      }
      const before = { ...entity };
      await repo.remove(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.DELETE, id, { before });
    });
  }

  private async isInUse(especificidadId: number, manager: DataSource['manager']) {
    const habilitadoRepo = manager.getRepository(ServicioHabilitadoEntity);
    const criterioRepo = manager.getRepository(CriterioAplicacionEntity);
    if (await habilitadoRepo.exists({ where: { especificidadId } })) return true;
    if (await criterioRepo.exists({ where: { especificidadId } })) return true;
    return false;
  }

  private async assertServicioExists(servicioCatalogoId: number) {
    const exists = await this.servicioRepository.exists({
      where: { id: servicioCatalogoId },
    });
    if (!exists) {
      throw new BadRequestException({
        code: 'SERVICE_NOT_FOUND',
        message: 'El servicio de catálogo indicado no existe.',
      });
    }
  }

  private async assertCombinacionUnique(
    servicioCatalogoId: number,
    codigo: string,
    excludeId?: number,
  ) {
    const existing = await this.especificidadRepository.findOne({
      where: { servicioCatalogoId, codigo },
    });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException(
        'ESPECIFICIDAD_CONFLICT',
        'La especificidad con este código ya existe para el servicio.',
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
        tablaAfectada: 'especificidad_servicio',
        registroId,
        detalles,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
      manager,
    );
  }
}
