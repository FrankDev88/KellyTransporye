import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/login.command';
import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Result } from '../../../domain/result';
import * as bcrypt from 'bcryptjs';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, Result<LoginResponse>> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<Result<LoginResponse>> {
    const { dto } = command;

    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return Result.fail('Credenciales inválidas.');
    }

    // 2. Verificar contraseña
    if (!user.password) {
      return Result.fail('Credenciales inválidas o usuario sin contraseña configurada.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      return Result.fail('Credenciales inválidas.');
    }

    // 3. Generar JWT Payload
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload);

    return Result.ok({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  }
}
