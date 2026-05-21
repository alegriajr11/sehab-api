import { registerAs } from '@nestjs/config';

export const authConfigKey = 'auth';

export default registerAs(authConfigKey, () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'sehab-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
}));
