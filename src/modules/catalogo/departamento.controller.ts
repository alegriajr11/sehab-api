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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DepartamentoService } from './departamento.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@ApiTags('Catálogo — Departamentos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
@Controller('departamentos')
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar departamentos (paginado)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.departamentoService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener departamento por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departamentoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear departamento' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Código DANE duplicado' })
  create(
    @Body() dto: CreateDepartamentoDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.departamentoService.create(dto, user, meta);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar departamento' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartamentoDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.departamentoService.update(id, dto, user, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar departamento' })
  @ApiResponse({ status: 409, description: 'Tiene municipios asociados' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.departamentoService.remove(id, user, meta);
  }
}
