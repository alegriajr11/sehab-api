import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { normalizeCatalogCode } from '../../../../common/utils/catalog-code.util';

export class CreateGrupoServicioDto {
  @ApiProperty({ example: 'HOSP' })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeCatalogCode(value) : value,
  )
  @IsString()
  @Matches(/^[A-Z0-9_-]+$/i, { message: 'El código solo permite caracteres alfanuméricos, guion y guion bajo.' })
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Hospitalización' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @ApiPropertyOptional({ example: 'Servicios de hospitalización.' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
