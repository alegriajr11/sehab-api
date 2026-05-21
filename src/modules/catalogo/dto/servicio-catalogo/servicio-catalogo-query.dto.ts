import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { normalizeCatalogCode } from '../../../../common/utils/catalog-code.util';

export class ServicioCatalogoQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  grupoId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeCatalogCode(value) : value,
  )
  @IsString()
  codigo_reps?: string;
}
