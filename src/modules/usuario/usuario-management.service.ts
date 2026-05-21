import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RolEntity } from './entities/rol.entity';
import { UsuarioEntity } from './entities/usuario.entity';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsuarioManagementService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.usuarioRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.rol', 'r');

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(u.nombre LIKE :term OR u.email LIKE :term)', { term });
    }

    qb.orderBy('u.nombre', 'ASC');
    qb.skip((page - 1) * size).take(size);
    const [data, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(
      data.map((u) => this.toSafeResponse(u)),
      total,
      page,
      size,
    );
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { rol: true },
    });
    if (!usuario) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado.',
      });
    }
    return this.toSafeResponse(usuario);
  }

  async create(
    dto: CreateUsuarioDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    await this.assertRolExists(dto.rol_id);
    await this.assertEmailUnique(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(UsuarioEntity);
      const entity = repo.create({
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        rolId: dto.rol_id,
        telefono: dto.telefono ?? null,
        activo: dto.activo ?? true,
      });
      const saved = await repo.save(entity);
      const withRol = await repo.findOne({
        where: { id: saved.id },
        relations: { rol: true },
      });

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.CREATE,
          tablaAfectada: 'usuario',
          registroId: saved.id,
          detalles: { after: this.toSafeResponse(withRol!) },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );

      return this.toSafeResponse(withRol!);
    });
  }

  async update(
    id: number,
    dto: UpdateUsuarioDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(UsuarioEntity);
      const entity = await repo.findOne({
        where: { id },
        relations: { rol: true },
      });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado.',
        });
      }

      const before = this.toSafeResponse(entity);

      if (dto.rol_id !== undefined) {
        await this.assertRolExists(dto.rol_id);
        entity.rolId = dto.rol_id;
      }
      if (dto.nombre !== undefined) entity.nombre = dto.nombre;
      if (dto.email !== undefined) {
        await this.assertEmailUnique(dto.email, id);
        entity.email = dto.email;
      }
      if (dto.telefono !== undefined) entity.telefono = dto.telefono;
      if (dto.activo !== undefined) entity.activo = dto.activo;
      if (dto.password) {
        entity.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      }

      const saved = await repo.save(entity);
      const withRol = await repo.findOne({
        where: { id: saved.id },
        relations: { rol: true },
      });

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.UPDATE,
          tablaAfectada: 'usuario',
          registroId: saved.id,
          detalles: { before, after: this.toSafeResponse(withRol!) },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );

      return this.toSafeResponse(withRol!);
    });
  }

  async remove(id: number, user: AuthenticatedUser, meta: RequestMeta) {
    if (id === user.id) {
      throw new BusinessException(
        'CANNOT_DELETE_SELF',
        'No puede eliminar su propio usuario.',
        409,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(UsuarioEntity);
      const entity = await repo.findOne({
        where: { id },
        relations: { rol: true },
      });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado.',
        });
      }

      const before = this.toSafeResponse(entity);
      await repo.remove(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.DELETE,
          tablaAfectada: 'usuario',
          registroId: id,
          detalles: { before },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );
    });
  }

  private async assertRolExists(rolId: number) {
    const exists = await this.rolRepository.exists({ where: { id: rolId } });
    if (!exists) {
      throw new NotFoundException({
        code: 'ROLE_NOT_FOUND',
        message: 'El rol indicado no existe.',
      });
    }
  }

  private async assertEmailUnique(email: string, excludeId?: number) {
    const existing = await this.usuarioRepository.findOne({
      where: { email },
    });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException(
        'EMAIL_CONFLICT',
        'El correo electrónico ya está registrado.',
        409,
      );
    }
  }

  private toSafeResponse(usuario: UsuarioEntity) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      activo: usuario.activo,
      telefono: usuario.telefono,
      rol_id: usuario.rolId,
      rol: usuario.rol
        ? { id: usuario.rol.id, nombre: usuario.rol.nombre }
        : undefined,
      firma_digital_url: usuario.firmaDigitalUrl,
      ultimo_login: usuario.ultimoLogin,
      created_at: usuario.createdAt,
      updated_at: usuario.updatedAt,
    };
  }
}
