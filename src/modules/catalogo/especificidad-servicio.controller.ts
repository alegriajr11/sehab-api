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
import { CreateEspecificidadDto } from './dto/especificidad/create-especificidad.dto';
import { EspecificidadQueryDto } from './dto/especificidad/especificidad-query.dto';
import { UpdateEspecificidadDto } from './dto/especificidad/update-especificidad.dto';
import { EspecificidadServicioService } from './especificidad-servicio.service';

@ApiTags('Catálogo normativo — Especificidades')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@CatalogNormativoRoles()
@Controller('especificidades')
export class EspecificidadServicioController {
  constructor(private readonly service: EspecificidadServicioService) {}

  @Get()
  findAll(@Query() query: EspecificidadQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear especificidad de servicio' })
  create(
    @Body() dto: CreateEspecificidadDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.service.create(dto, user, meta);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEspecificidadDto,
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
