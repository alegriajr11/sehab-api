import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión y obtener JWT',
    description:
      'Autentica con correo y contraseña. Use el usuario ADMIN sembrado al arranque (variables SEED_ADMIN_* en .env) o cualquier usuario activo.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciales de acceso',
    examples: {
      adminDefault: {
        summary: 'Usuario ADMIN por defecto (semilla)',
        description:
          'Valores configurables en .env: SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD',
        value: {
          email: 'usuario@correo.com',
          password: 'Password123!',
        },
      },
      adminMigracion: {
        summary: 'Usuario ADMIN de migración (alternativo)',
        value: {
          email: 'admin@sehab.gov.co',
          password: 'Admin123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada correctamente',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas o usuario inactivo',
    schema: {
      example: {
        statusCode: 401,
        message: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas.',
        },
        error: 'Unauthorized',
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
