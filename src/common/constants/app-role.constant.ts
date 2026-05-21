/**
 * Roles del sistema SEHAB (tabla `rol.nombre`).
 */
export const AppRole = {
  ADMIN: 'ADMIN',
  GESTOR_NORMATIVO: 'GESTOR_NORMATIVO',
  RES: 'RES',
  PAMEC: 'PAMEC',
  SP: 'SP',
  SIC: 'SIC',
} as const;

/** Roles con acceso a catálogos normativos (RF-CAT-002). */
export const CATALOG_NORMATIVO_ROLES = [
  AppRole.ADMIN,
  AppRole.GESTOR_NORMATIVO,
] as const;

export type AppRoleType = (typeof AppRole)[keyof typeof AppRole];

export const ALL_APP_ROLES: AppRoleType[] = Object.values(AppRole);
