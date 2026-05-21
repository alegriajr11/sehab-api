import { PartialType } from '@nestjs/swagger';
import { CreateComplejidadDto } from './create-complejidad.dto';

export class UpdateComplejidadDto extends PartialType(CreateComplejidadDto) {}
