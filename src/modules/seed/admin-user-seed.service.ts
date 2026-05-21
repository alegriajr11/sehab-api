import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppRole } from '../../common/constants/app-role.constant';
import { seedConfigKey } from '../../config/seed.config';
import { RolEntity } from '../usuario/entities/rol.entity';
import { UsuarioEntity } from '../usuario/entities/usuario.entity';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AdminUserSeedService {
  private readonly logger = new Logger(AdminUserSeedService.name);

  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crea el usuario ADMIN por defecto si no existe ningún usuario con rol ADMIN.
   * Credenciales y datos personales se leen desde variables de entorno (.env).
   */
  async seedAdminUser(): Promise<'created' | 'skipped' | 'failed'> {
    const config = this.configService.get<{
      adminOnBoot: boolean;
      adminNombre: string;
      adminEmail: string;
      adminPassword: string;
      adminTelefono: string;
    }>(seedConfigKey)!;

    if (!config.adminOnBoot) {
      this.logger.log(
        'Semilla de usuario ADMIN deshabilitada (SEED_ADMIN_ON_BOOT=false).',
      );
      return 'skipped';
    }

    if (!config.adminPassword?.trim()) {
      this.logger.error(
        'SEED_ADMIN_PASSWORD no está definida. No se creó el usuario ADMIN.',
      );
      return 'failed';
    }

    const adminRole = await this.rolRepository.findOne({
      where: { nombre: AppRole.ADMIN },
    });

    if (!adminRole) {
      this.logger.warn(
        'Rol ADMIN no encontrado. Ejecute primero la semilla de roles.',
      );
      return 'failed';
    }

    const adminUserExists = await this.usuarioRepository
      .createQueryBuilder('u')
      .innerJoin('u.rol', 'r')
      .where('r.nombre = :rolNombre', { rolNombre: AppRole.ADMIN })
      .getExists();

    if (adminUserExists) {
      this.logger.log(
        'Ya existe al menos un usuario con rol ADMIN. Semilla de usuario omitida.',
      );
      return 'skipped';
    }

    const email = config.adminEmail.trim().toLowerCase();
    const emailInUse = await this.usuarioRepository.exists({
      where: { email },
    });

    if (emailInUse) {
      this.logger.warn(
        `El correo ${email} ya está registrado con otro rol. No se creó el usuario ADMIN por defecto.`,
      );
      return 'skipped';
    }

    const passwordHash = await bcrypt.hash(
      config.adminPassword,
      BCRYPT_ROUNDS,
    );

    const usuario = this.usuarioRepository.create({
      nombre: config.adminNombre.trim(),
      email,
      passwordHash,
      rolId: adminRole.id,
      telefono: config.adminTelefono?.trim() || null,
      activo: true,
    });

    await this.usuarioRepository.save(usuario);

    this.logger.log(
      `Usuario ADMIN creado: ${email} (rol_id=${adminRole.id}). Configure credenciales en .env.`,
    );

    return 'created';
  }
}
