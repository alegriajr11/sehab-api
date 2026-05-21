import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { normalizeCatalogCode } from '../../../../common/utils/catalog-code.util';

export class CreateEspecificidadDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  servicio_catalogo_id: number;

  @ApiProperty({ example: 'CARDIO-INT' })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeCatalogCode(value) : value,
  )
  @IsString()
  @Matches(/^[A-Z0-9_-]+$/i)
  @MaxLength(30)
  codigo: string;

  @ApiProperty({ example: 'Cardio Integrad' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;
}
