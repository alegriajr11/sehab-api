import { PartialType } from '@nestjs/swagger';
import { CreateEspecificidadDto } from './create-especificidad.dto';

export class UpdateEspecificidadDto extends PartialType(CreateEspecificidadDto) {}
