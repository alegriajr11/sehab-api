import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { authConfigKey } from '../../config/auth.config';
import { AppRoleType } from '../../common/constants/app-role.constant';
import { UsuarioEntity } from '../usuario/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
      relations: { rol: true },
    });

    if (!usuario || !usuario.activo || !usuario.rol?.activo) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas.',
      });
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas.',
      });
    }

    usuario.ultimoLogin = new Date();
    await this.usuarioRepository.save(usuario);

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rolNombre: usuario.rol.nombre as AppRoleType,
    };

    const expiresIn =
      this.configService.get<string>(`${authConfigKey}.jwtExpiresIn`) ?? '8h';

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: expiresIn,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
      },
    };
  }
}
