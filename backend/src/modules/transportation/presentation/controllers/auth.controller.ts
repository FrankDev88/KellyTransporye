import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../dtos/auth.dto';
import { LoginCommand } from '../../application/auth/commands/login.command';
import { Response } from 'express';
import { Public } from '../../infrastructure/auth/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) { }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Iniciar sesión y obtener token JWT',
    description: 'Valida las credenciales del usuario (email y password) y retorna un Access Token (JWT) válido por 24 horas para acceder a los endpoints protegidos.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa, retorna el token y datos básicos del perfil.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'admin@transporte.com',
          role: 'ADMIN',
          fullName: 'Administrador Principal',
        }
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas: Email o contraseña incorrectos.',
    schema: {
      example: {
        message: 'Credenciales inválidas.',
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.commandBus.execute(new LoginCommand(loginDto));

    if (result.isFailure) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: result.error || 'Credenciales inválidas.',
      });
    }

    return res.status(HttpStatus.OK).json(result.getValue());
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión (Invalidación por parte del cliente)',
    description: '🔐 **Roles Permitidos:** `ADMIN`, `DRIVER`, `PARENT`\n\nEndpoint informativo para marcar el fin de la sesión. El cliente debe eliminar el token localmente.'
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje de éxito confirmando el cierre de sesión.',
    schema: {
      example: {
        message: 'Sesión terminada exitosamente. Por favor elimina tu token en el cliente.',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado: Token JWT ausente o inválido.' })
  async logout(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Sesión terminada exitosamente. Por favor elimina tu token en el cliente.',
    });
  }
}
