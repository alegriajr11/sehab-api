import { PartialType } from '@nestjs/swagger';
import { CreateGrupoServicioDto } from './create-grupo-servicio.dto';

export class UpdateGrupoServicioDto extends PartialType(CreateGrupoServicioDto) {}
