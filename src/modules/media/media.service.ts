import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MediaEntity } from './entities';
import { MediaOwnerTypeEnum } from '../../common/enums';
import { CreateMediaDto } from './dto/create-media.dto';

/**
 * Mapeo de ownerType a la tabla correspondiente en la BD.
 * Permite validar la existencia del owner antes de crear un registro media.
 */
const OWNER_TABLE_MAP: Record<MediaOwnerTypeEnum, string | null> = {
  [MediaOwnerTypeEnum.PRESTADOR]: 'prestador',
  [MediaOwnerTypeEnum.SEDE]: 'sede',
  [MediaOwnerTypeEnum.SERVICIO_HABILITADO]: 'servicio_habilitado',
  [MediaOwnerTypeEnum.VISITA]: 'visita',
  [MediaOwnerTypeEnum.ACTA_VISITA]: 'acta_visita',
  [MediaOwnerTypeEnum.AUTOEVALUACION]: 'autoevaluacion',
  [MediaOwnerTypeEnum.NOVEDAD]: 'novedad',
  [MediaOwnerTypeEnum.CERTIFICADO]: 'certificado_habilitacion',
  [MediaOwnerTypeEnum.DISTINTIVO]: 'distintivo_habilitacion',
  [MediaOwnerTypeEnum.CRITERIO]: 'criterio',
  [MediaOwnerTypeEnum.USUARIO]: 'usuario',
  [MediaOwnerTypeEnum.OTRO]: null, // No se valida existencia para tipo OTRO
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea un registro de media validando que el owner exista en la BD.
   * Previene la creación de archivos huérfanos desde el inicio.
   */
  async create(dto: CreateMediaDto): Promise<MediaEntity> {
    await this.validateOwnerExists(dto.ownerType, dto.ownerId);

    const media = this.mediaRepository.create({
      ownerType: dto.ownerType,
      ownerId: dto.ownerId,
      url: dto.url,
      filename: dto.filename,
      mimeType: dto.mimeType,
      size: dto.size ?? 0,
      checksum: dto.checksum ?? null,
    });

    return this.mediaRepository.save(media);
  }

  /**
   * Obtiene todos los archivos media asociados a un owner específico.
   */
  async findByOwner(
    ownerType: MediaOwnerTypeEnum,
    ownerId: number,
  ): Promise<MediaEntity[]> {
    return this.mediaRepository.find({
      where: { ownerType, ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Elimina un registro de media por su ID.
   */
  async remove(id: number): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media con id ${id} no encontrada`);
    }
    await this.mediaRepository.remove(media);
  }

  /**
   * Valida que el owner referenciado exista en la tabla correspondiente.
   * Lanza NotFoundException si el owner no existe.
   * Para ownerType = OTRO, no se realiza validación.
   */
  private async validateOwnerExists(
    ownerType: MediaOwnerTypeEnum,
    ownerId: number,
  ): Promise<void> {
    const tableName = OWNER_TABLE_MAP[ownerType];

    if (!tableName) {
      // ownerType OTRO no requiere validación
      return;
    }

    const result = await this.dataSource.query(
      `SELECT 1 FROM \`${tableName}\` WHERE id = ? LIMIT 1`,
      [ownerId],
    );

    if (!result || result.length === 0) {
      throw new BadRequestException(
        `El owner de tipo '${ownerType}' con id ${ownerId} no existe. ` +
          `No se puede asociar un archivo a una entidad inexistente.`,
      );
    }
  }
}
