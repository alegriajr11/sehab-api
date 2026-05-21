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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppRole } from '../../common/constants/app-role.constant';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  RequestMeta,
  RequestMeta as RequestMetaDecorator,
} from '../../common/decorators/request-meta.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { MunicipioQueryDto } from './dto/municipio-query.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { MunicipioService } from './municipio.service';

@ApiTags('Catálogo — Municipios')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
@Controller('municipios')
export class MunicipioController {
  constructor(private readonly municipioService: MunicipioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar municipios (paginado y filtro por departamento)' })
  @ApiQuery({ name: 'departmentId', required: false })
  findAll(@Query() query: MunicipioQueryDto) {
    return this.municipioService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener municipio por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.municipioService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear municipio' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Código DANE duplicado' })
  create(
    @Body() dto: CreateMunicipioDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.municipioService.create(dto, user, meta);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar municipio' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMunicipioDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.municipioService.update(id, dto, user, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar municipio' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.municipioService.remove(id, user, meta);
  }
}
