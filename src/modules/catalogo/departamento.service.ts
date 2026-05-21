import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import {
  DANE_DEPARTAMENTO_LENGTH,
  normalizeCodigoDane,
} from '../../common/utils/dane.util';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { DepartamentoEntity } from './entities/departamento.entity';
import { MunicipioEntity } from './entities/municipio.entity';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(DepartamentoEntity)
    private readonly departamentoRepository: Repository<DepartamentoEntity>,
    @InjectRepository(MunicipioEntity)
    private readonly municipioRepository: Repository<MunicipioEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<DepartamentoEntity>> {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.departamentoRepository.createQueryBuilder('d');

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(d.nombre LIKE :term OR d.codigoDane LIKE :term)', { term });
    }

    qb.orderBy('d.nombre', 'ASC');
    qb.skip((page - 1) * size).take(size);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number): Promise<DepartamentoEntity> {
    const departamento = await this.departamentoRepository.findOne({
      where: { id },
    });
    if (!departamento) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Departamento no encontrado.',
      });
    }
    return departamento;
  }

  async create(
    dto: CreateDepartamentoDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ): Promise<DepartamentoEntity> {
    const codigoDane = normalizeCodigoDane(
      dto.codigo_dane,
      DANE_DEPARTAMENTO_LENGTH,
    );

    await this.assertCodigoDaneUnique(codigoDane);

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(DepartamentoEntity);
      const entity = repo.create({
        nombre: dto.nombre,
        codigoDane,
      });
      const saved = await repo.save(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.CREATE,
          tablaAfectada: 'departamento',
          registroId: saved.id,
          detalles: { after: this.toAuditSnapshot(saved) },
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
    dto: UpdateDepartamentoDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ): Promise<DepartamentoEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(DepartamentoEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Departamento no encontrado.',
        });
      }

      const before = this.toAuditSnapshot(entity);

      if (dto.nombre !== undefined) {
        entity.nombre = dto.nombre;
      }

      if (dto.codigo_dane !== undefined) {
        const codigoDane = normalizeCodigoDane(
          dto.codigo_dane,
          DANE_DEPARTAMENTO_LENGTH,
        );
        if (codigoDane !== entity.codigoDane) {
          await this.assertCodigoDaneUnique(codigoDane, id);
          entity.codigoDane = codigoDane;
        }
      }

      const saved = await repo.save(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.UPDATE,
          tablaAfectada: 'departamento',
          registroId: saved.id,
          detalles: {
            before,
            after: this.toAuditSnapshot(saved),
          },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );

      return saved;
    });
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(DepartamentoEntity);
      const municipioRepo = manager.getRepository(MunicipioEntity);

      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Departamento no encontrado.',
        });
      }

      const municipiosCount = await municipioRepo.count({
        where: { departamentoId: id },
      });

      if (municipiosCount > 0) {
        throw new BusinessException(
          'DEPARTMENT_HAS_MUNICIPALITIES',
          'No es posible eliminar el departamento porque tiene municipios asociados.',
          409,
        );
      }

      const before = this.toAuditSnapshot(entity);
      await repo.remove(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.DELETE,
          tablaAfectada: 'departamento',
          registroId: id,
          detalles: { before },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );
    });
  }

  private async assertCodigoDaneUnique(
    codigoDane: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.departamentoRepository.findOne({
      where: { codigoDane },
    });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException(
        'DANE_CONFLICT',
        'Código DANE ya existe para otro departamento.',
        409,
      );
    }
  }

  private toAuditSnapshot(entity: DepartamentoEntity) {
    return {
      id: entity.id,
      nombre: entity.nombre,
      codigo_dane: entity.codigoDane,
    };
  }
}
