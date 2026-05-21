import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class MunicipioQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por departamento' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  departmentId?: number;
}
