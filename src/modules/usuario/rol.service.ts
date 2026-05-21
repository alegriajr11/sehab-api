import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolEntity } from './entities/rol.entity';
import { UsuarioEntity } from './entities/usuario.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.rolRepository.createQueryBuilder('r');

    if (query.search?.trim()) {
      qb.andWhere('r.nombre LIKE :term', {
        term: `%${query.search.trim()}%`,
      });
    }

    qb.orderBy('r.nombre', 'ASC');
    qb.skip((page - 1) * size).take(size);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number) {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Rol no encontrado.',
      });
    }
    return rol;
  }

  async create(dto: CreateRolDto, user: AuthenticatedUser, meta: RequestMeta) {
    await this.assertNombreUnique(dto.nombre);

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RolEntity);
      const entity = repo.create({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        activo: dto.activo ?? true,
      });
      const saved = await repo.save(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.CREATE,
          tablaAfectada: 'rol',
          registroId: saved.id,
          detalles: { after: saved },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );

      return saved;
    });
  }

  async update(
    id: number,
    dto: UpdateRolDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RolEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Rol no encontrado.',
        });
      }

      const before = { ...entity };

      if (dto.nombre !== undefined && dto.nombre !== entity.nombre) {
        await this.assertNombreUnique(dto.nombre, id);
        entity.nombre = dto.nombre;
      }
      if (dto.descripcion !== undefined) entity.descripcion = dto.descripcion;
      if (dto.activo !== undefined) entity.activo = dto.activo;

      const saved = await repo.save(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.UPDATE,
          tablaAfectada: 'rol',
          registroId: saved.id,
          detalles: { before, after: saved },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );

      return saved;
    });
  }

  async remove(id: number, user: AuthenticatedUser, meta: RequestMeta) {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RolEntity);
      const usuarioRepo = manager.getRepository(UsuarioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Rol no encontrado.',
        });
      }

      const usuariosCount = await usuarioRepo.count({ where: { rolId: id } });
      if (usuariosCount > 0) {
        throw new BusinessException(
          'ROLE_HAS_USERS',
          'No es posible eliminar el rol porque tiene usuarios asociados.',
          409,
        );
      }

      const before = { ...entity };
      await repo.remove(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.DELETE,
          tablaAfectada: 'rol',
          registroId: id,
          detalles: { before },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );
    });
  }

  private async assertNombreUnique(nombre: string, excludeId?: number) {
    const existing = await this.rolRepository.findOne({ where: { nombre } });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException(
        'ROLE_NAME_CONFLICT',
        'Ya existe un rol con ese nombre.',
        409,
      );
    }
  }
}
