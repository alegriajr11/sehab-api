import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { authConfigKey } from '../../../config/auth.config';
import { AppRoleType } from '../../../common/constants/app-role.constant';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  rolNombre: AppRoleType;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(`${authConfigKey}.jwtSecret`)!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub, activo: true },
      relations: { rol: true },
    });

    if (!usuario || !usuario.rol?.activo) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Sesión inválida o usuario inactivo.',
      });
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rolId: usuario.rolId,
      rolNombre: usuario.rol.nombre as AppRoleType,
    };
  }
}
