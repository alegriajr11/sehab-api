import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { AuditoriaAccionEnum } from '../../common/enums/auditoria-accion.enum';
import { BusinessException } from '../../common/exceptions/business.exception';
import {
  DANE_MUNICIPIO_LENGTH,
  normalizeCodigoDane,
} from '../../common/utils/dane.util';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { MunicipioQueryDto } from './dto/municipio-query.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { DepartamentoEntity } from './entities/departamento.entity';
import { MunicipioEntity } from './entities/municipio.entity';

@Injectable()
export class MunicipioService {
  constructor(
    @InjectRepository(MunicipioEntity)
    private readonly municipioRepository: Repository<MunicipioEntity>,
    @InjectRepository(DepartamentoEntity)
    private readonly departamentoRepository: Repository<DepartamentoEntity>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    query: MunicipioQueryDto,
  ): Promise<PaginatedResponseDto<MunicipioEntity>> {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const qb = this.municipioRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.departamento', 'd');

    if (query.departmentId) {
      qb.andWhere('m.departamentoId = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(m.nombre LIKE :term OR m.codigoDane LIKE :term)', { term });
    }

    qb.orderBy('m.nombre', 'ASC');
    qb.skip((page - 1) * size).take(size);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, size);
  }

  async findOne(id: number): Promise<MunicipioEntity> {
    const municipio = await this.municipioRepository.findOne({
      where: { id },
      relations: { departamento: true },
    });
    if (!municipio) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Municipio no encontrado.',
      });
    }
    return municipio;
  }

  async create(
    dto: CreateMunicipioDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ): Promise<MunicipioEntity> {
    await this.assertDepartamentoExists(dto.departamento_id);

    const codigoDane = normalizeCodigoDane(
      dto.codigo_dane,
      DANE_MUNICIPIO_LENGTH,
    );
    await this.assertCodigoDaneUnique(codigoDane);

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(MunicipioEntity);
      const entity = repo.create({
        departamentoId: dto.departamento_id,
        nombre: dto.nombre,
        codigoDane,
      });
      const saved = await repo.save(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.CREATE,
          tablaAfectada: 'municipio',
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
    dto: UpdateMunicipioDto,
    user: AuthenticatedUser,
    meta: RequestMeta,
  ): Promise<MunicipioEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(MunicipioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Municipio no encontrado.',
        });
      }

      const before = this.toAuditSnapshot(entity);

      if (dto.departamento_id !== undefined) {
        await this.assertDepartamentoExists(dto.departamento_id);
        entity.departamentoId = dto.departamento_id;
      }

      if (dto.nombre !== undefined) {
        entity.nombre = dto.nombre;
      }

      if (dto.codigo_dane !== undefined) {
        const codigoDane = normalizeCodigoDane(
          dto.codigo_dane,
          DANE_MUNICIPIO_LENGTH,
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
          tablaAfectada: 'municipio',
          registroId: saved.id,
          detalles: { before, after: this.toAuditSnapshot(saved) },
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
      const repo = manager.getRepository(MunicipioEntity);
      const entity = await repo.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Municipio no encontrado.',
        });
      }

      const before = this.toAuditSnapshot(entity);
      await repo.remove(entity);

      await this.auditoriaService.log(
        {
          usuarioId: user.id,
          accion: AuditoriaAccionEnum.DELETE,
          tablaAfectada: 'municipio',
          registroId: id,
          detalles: { before },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
        manager,
      );
    });
  }

  private async assertDepartamentoExists(departamentoId: number): Promise<void> {
    const exists = await this.departamentoRepository.exists({
      where: { id: departamentoId },
    });
    if (!exists) {
      throw new BadRequestException({
        code: 'DEPARTMENT_NOT_FOUND',
        message: 'El departamento indicado no existe.',
      });
    }
  }

  private async assertCodigoDaneUnique(
    codigoDane: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.municipioRepository.findOne({
      where: { codigoDane },
    });
    if (existing && existing.id !== excludeId) {
      throw new BusinessException(
        'DANE_CONFLICT',
        'Código DANE ya existe para otro municipio.',
        409,
      );
    }
  }

  private toAuditSnapshot(entity: MunicipioEntity) {
    return {
      id: entity.id,
      departamento_id: entity.departamentoId,
      nombre: entity.nombre,
      codigo_dane: entity.codigoDane,
    };
  }
}
