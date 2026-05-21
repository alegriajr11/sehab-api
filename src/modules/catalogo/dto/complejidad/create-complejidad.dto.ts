import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateComplejidadDto {
  @ApiProperty({ example: 'ALTA' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nivel: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;
}
