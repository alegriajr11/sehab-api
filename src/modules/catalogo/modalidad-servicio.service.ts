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
import { CreateModalidadDto } from './dto/modalidad/create-modalidad.dto';
import { UpdateModalidadDto } from './dto/modalidad/update-modalidad.dto';
import { ModalidadServicioEntity } from './entities/modalidad-servicio.entity';

@Injectable()
export class ModalidadServicioService {
  constructor(
    @InjectRepository(ModalidadServicioEntity)
    private readonly modalidadRepository: Repository<ModalidadServicioEntity>,
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
    const qb = this.modalidadRepository.createQueryBuilder('m');
    if (query.search?.trim()) {
      qb.andWhere('m.nombre LIKE :term', { term: `%${query.search.trim()}%` });
    }
    qb.orderBy('m.nombre', 'ASC').skip((page - 1) * size).take(size);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number) {
    const entity = await this.modalidadRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Modalidad no encontrada.' });
    }
    return entity;
  }

  async create(dto: CreateModalidadDto, user: AuthenticatedUser, meta: RequestMeta) {
    await this.assertNombreUnique(dto.nombre);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ModalidadServicioEntity);
      const saved = await repo.save(
        repo.create({ nombre: dto.nombre, descripcion: dto.descripcion ?? null }),
      );
      await this.audit(manager, user, meta, AuditoriaAccionEnum.CREATE, saved.id, { after: saved });
      return saved;
    });
  }

  async update(id: number, dto: UpdateModalidadDto, user: AuthenticatedUser, meta: RequestMeta) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ModalidadServicioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Modalidad no encontrada.' });
      const before = { ...entity };
      if (dto.nombre !== undefined && dto.nombre !== entity.nombre) {
        await this.assertNombreUnique(dto.nombre, id);
        entity.nombre = dto.nombre;
      }
      if (dto.descripcion !== undefined) entity.descripcion = dto.descripcion ?? null;
      const saved = await repo.save(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.UPDATE, saved.id, { before, after: saved });
      return saved;
    });
  }

  async remove(id: number, user: AuthenticatedUser, meta: RequestMeta) {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ModalidadServicioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Modalidad no encontrada.' });
      if (await this.isInUse(id, manager)) {
        throw new BusinessException(
          'SERVICE_IN_USE',
          'La modalidad está en uso y no puede eliminarse.',
          409,
        );
      }
      const before = { ...entity };
      await repo.remove(entity);
      await this.audit(manager, user, meta, AuditoriaAccionEnum.DELETE, id, { before });
    });
  }

  private async isInUse(modalidadId: number, manager: DataSource['manager']) {
    const habilitadoRepo = manager.getRepository(ServicioHabilitadoEntity);
    const criterioRepo = manager.getRepository(CriterioAplicacionEntity);
    if (await habilitadoRepo.exists({ where: { modalidadId } })) return true;
    if (await criterioRepo.exists({ where: { modalidadId } })) return true;
    return false;
  }

  private async assertNombreUnique(nombre: string, excludeId?: number) {
    const existing = await this.modalidadRepository.findOne({ where: { nombre } });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException('MODALITY_NAME_CONFLICT', 'El nombre de modalidad ya existe.', 409);
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
        tablaAfectada: 'modalidad_servicio',
        registroId,
        detalles,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
      manager,
    );
  }
}
