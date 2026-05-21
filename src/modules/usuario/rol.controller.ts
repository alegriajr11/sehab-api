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
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolService } from './rol.service';

@ApiTags('Usuarios — Roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
@Controller('roles')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.rolService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateRolDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.rolService.create(dto, user, meta);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolDto,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.rolService.update(id, dto, user, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar rol (si no tiene usuarios)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @RequestMetaDecorator() meta: RequestMeta,
  ) {
    return this.rolService.remove(id, user, meta);
  }
}
