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
import {
  DANE_MUNICIPIO_LENGTH,
  normalizeCodigoDane,
} from '../../../common/utils/dane.util';

export class CreateMunicipioDto {
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt({ message: 'El departamento_id debe ser un número entero.' })
  @IsPositive({ message: 'El departamento_id debe ser mayor a cero.' })
  departamento_id: number;

  @ApiProperty({ example: 'Mocoa' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(150, { message: 'El nombre no puede superar 150 caracteres.' })
  nombre: string;

  @ApiProperty({ example: '86001' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? normalizeCodigoDane(value, DANE_MUNICIPIO_LENGTH)
      : value,
  )
  @IsString()
  @Matches(/^\d{5,8}$/, {
    message: 'El código DANE debe contener entre 5 y 8 dígitos.',
  })
  codigo_dane: string;
}
