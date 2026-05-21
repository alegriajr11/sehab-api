import { ApiProperty } from '@nestjs/swagger';

class LoginUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Samir Alegria' })
  nombre: string;

  @ApiProperty({ example: 'usuario@correo.com' })
  email: string;

  @ApiProperty({ example: 'ADMIN', description: 'Nombre del rol asignado' })
  rol: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT para enviar en Authorization: Bearer <token>',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZWR3YXIuYWxlZ3JpYUBob3RtYWlsLmNvbSIsInJvbE5vbWJyZSI6IkFETUlOIn0.example',
  })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: '8h', description: 'Tiempo de expiración del token' })
  expiresIn: string;

  @ApiProperty({ type: LoginUserDto })
  user: LoginUserDto;
}
