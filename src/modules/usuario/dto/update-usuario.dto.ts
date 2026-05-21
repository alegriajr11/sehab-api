import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['password'] as const),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password?: string;
}
