import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CatalogNormativoRoles } from '../../common/decorators/catalog-normativo-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestMeta, RequestMeta as RequestMetaDecorator } from '../../common/decorators/request-meta.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateComplejidadDto } from './dto/complejidad/create-complejidad.dto';
import { UpdateComplejidadDto } from './dto/complejidad/update-complejidad.dto';
import { ComplejidadService } from './complejidad.service';

@ApiTags('Catálogo normativo — Complejidad')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@CatalogNormativoRoles()
@Controller('complejidades')
export class ComplejidadController {
  constructor(private readonly service: ComplejidadService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateComplejidadDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.service.create(dto, user, meta);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComplejidadDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.service.update(id, dto, user, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.service.remove(id, user, meta);
  }
}
