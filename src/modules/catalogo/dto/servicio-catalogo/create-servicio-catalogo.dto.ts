import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { normalizeCatalogCode } from '../../../../common/utils/catalog-code.util';

export class CreateServicioCatalogoDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  grupo_servicio_id: number;

  @ApiProperty({ example: 'REPS-1234' })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeCatalogCode(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_-]+$/i)
  @MaxLength(30)
  codigo_reps: string;

  @ApiProperty({ example: 'Cirugía Mayor' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @ApiPropertyOptional({ example: 'Servicio de cirugía mayor' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
