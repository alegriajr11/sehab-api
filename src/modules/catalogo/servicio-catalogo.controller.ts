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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogNormativoRoles } from '../../common/decorators/catalog-normativo-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestMeta, RequestMeta as RequestMetaDecorator } from '../../common/decorators/request-meta.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateServicioCatalogoDto } from './dto/servicio-catalogo/create-servicio-catalogo.dto';
import { ServicioCatalogoQueryDto } from './dto/servicio-catalogo/servicio-catalogo-query.dto';
import { UpdateServicioCatalogoDto } from './dto/servicio-catalogo/update-servicio-catalogo.dto';
import { ServicioCatalogoService } from './servicio-catalogo.service';

@ApiTags('Catálogo normativo — Servicios REPS')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@CatalogNormativoRoles()
@Controller('servicios')
export class ServicioCatalogoController {
  constructor(private readonly service: ServicioCatalogoService) {}

  @Get()
  findAll(@Query() query: ServicioCatalogoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear servicio de catálogo REPS' })
  create(
    @Body() dto: CreateServicioCatalogoDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.service.create(dto, user, meta);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioCatalogoDto,
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
