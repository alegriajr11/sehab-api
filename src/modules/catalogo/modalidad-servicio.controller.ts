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
import { CreateModalidadDto } from './dto/modalidad/create-modalidad.dto';
import { UpdateModalidadDto } from './dto/modalidad/update-modalidad.dto';
import { ModalidadServicioService } from './modalidad-servicio.service';

@ApiTags('Catálogo normativo — Modalidades')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@CatalogNormativoRoles()
@Controller('modalidades')
export class ModalidadServicioController {
  constructor(private readonly service: ModalidadServicioService) {}

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
    @Body() dto: CreateModalidadDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.service.create(dto, user, meta);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModalidadDto,
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
