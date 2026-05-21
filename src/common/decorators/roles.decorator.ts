import { SetMetadata } from '@nestjs/common';
import { AppRoleType } from '../constants/app-role.constant';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AppRoleType[]) => SetMetadata(ROLES_KEY, roles);
