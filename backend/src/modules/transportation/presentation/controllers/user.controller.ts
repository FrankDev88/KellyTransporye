import { Body, Controller, Post, Res, HttpStatus, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/user.dto';
import { CreateUserCommand } from '../../application/user/commands/create-user.command';
import { GetAllUsersQuery } from '../../application/user/queries/get-all-users.query';
import { Response } from 'express';

@ApiTags('Users Management')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener lista de todos los usuarios registrados',
    description: '🔐 **Roles Permitidos:** `ADMIN`'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios recuperada exitosamente.',
  })
  async getUsers(@Res() res: Response) {
    const result = await this.queryBus.execute(new GetAllUsersQuery());

    if (result.isFailure) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: result.error || 'Error al obtener usuarios.',
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result.getValue(),
    });
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear un nuevo usuario en el sistema',
    description: '🔐 **Roles Permitidos:** `ADMIN`\n\nPermite dar de alta a nuevos conductores, padres de familia o administradores. Las contraseñas se almacenan de forma segura usando hash.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'El usuario ha sido creado exitosamente.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        message: 'Usuario creado exitosamente.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error de negocio: El email ya existe o los datos de validación son incorrectos.',
    schema: {
      example: {
        message: 'El usuario con este email ya existe.',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado: Token JWT ausente o inválido.' })
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const result = await this.commandBus.execute(
      new CreateUserCommand({
        email: createUserDto.email,
        password: createUserDto.password,
        fullName: createUserDto.fullName,
        role: createUserDto.role,
        phoneNumber: createUserDto.phoneNumber,
      }),
    );

    if (result.isFailure) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: result.error || 'Error desconocido.',
      });
    }

    return res.status(HttpStatus.CREATED).json({
      id: result.getValue(),
      message: 'Usuario creado exitosamente.',
    });
  }
}
