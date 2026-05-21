import { applyDecorators } from '@nestjs/common';
import { CATALOG_NORMATIVO_ROLES } from '../constants/app-role.constant';
import { Roles } from './roles.decorator';

export const CatalogNormativoRoles = () =>
  applyDecorators(Roles(...CATALOG_NORMATIVO_ROLES));
