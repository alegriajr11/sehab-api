import { registerAs } from '@nestjs/config';

export const seedConfigKey = 'seed';

export default registerAs(seedConfigKey, () => ({
  rolesOnBoot: process.env.SEED_ROLES_ON_BOOT !== 'false',
  adminOnBoot: process.env.SEED_ADMIN_ON_BOOT !== 'false',
  adminNombre: process.env.SEED_ADMIN_NOMBRE ?? 'Samir Alegria',
  adminEmail:
    process.env.SEED_ADMIN_EMAIL ?? 'edwar.alegria@hotmail.com',
  adminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'Samir11*',
  adminTelefono: process.env.SEED_ADMIN_TELEFONO ?? '3142458160',
}));
