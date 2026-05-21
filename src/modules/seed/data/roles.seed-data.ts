import { AppRoleType } from '../../../common/constants/app-role.constant';

export interface RolSeedDefinition {
  nombre: AppRoleType;
  descripcion: string;
  activo: boolean;
}

/**
 * Catálogo maestro de roles del sistema SEHAB.
 * Fuente única para la semilla en arranque de la API.
 */
export const ROLES_SEED_DATA: RolSeedDefinition[] = [
  {
    nombre: 'ADMIN',
    descripcion:
      'Superusuario con acceso total a la configuración maestra, gestión de usuarios, catálogos y auditoría del sistema.',
    activo: true,
  },
  {
    nombre: 'GESTOR_NORMATIVO',
    descripcion:
      'Gestión del catálogo normativo de servicios (grupos, servicios REPS, modalidades, complejidad y especificidades) conforme a la Resolución 3100 de 2019.',
    activo: true,
  },
  {
    nombre: 'RES',
    descripcion:
      'Usuario encargado de la gestión, evaluación y seguimiento de los estándares de la Resolución 3100 de 2019.',
    activo: true,
  },
  {
    nombre: 'PAMEC',
    descripcion:
      'Personal responsable del Programa de Auditoría para el Mejoramiento de la Calidad, con acceso al módulo de auditoría y planes de mejora.',
    activo: true,
  },
  {
    nombre: 'SP',
    descripcion:
      'Encargado de gestionar los reportes de eventos adversos, incidentes y la política de seguridad del paciente institucional.',
    activo: true,
  },
  {
    nombre: 'SIC',
    descripcion:
      'Usuario responsable de la captura de indicadores de calidad y la generación de reportes para el monitoreo institucional.',
    activo: true,
  },
];
