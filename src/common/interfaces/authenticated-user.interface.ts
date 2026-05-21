import { AppRoleType } from '../constants/app-role.constant';

export interface AuthenticatedUser {
  id: number;
  email: string;
  nombre: string;
  rolId: number;
  rolNombre: AppRoleType;
}
