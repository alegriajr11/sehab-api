import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  DANE_DEPARTAMENTO_LENGTH,
  normalizeCodigoDane,
} from '../../../common/utils/dane.util';

export class CreateDepartamentoDto {
  @ApiProperty({ example: 'Putumayo' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(150, { message: 'El nombre no puede superar 150 caracteres.' })
  nombre: string;

  @ApiProperty({ example: '86', description: 'Código DANE (2 a 5 dígitos)' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? normalizeCodigoDane(value, DANE_DEPARTAMENTO_LENGTH)
      : value,
  )
  @IsString()
  @Matches(/^\d{2,5}$/, {
    message: 'El código DANE debe contener entre 2 y 5 dígitos.',
  })
  codigo_dane: string;
}
