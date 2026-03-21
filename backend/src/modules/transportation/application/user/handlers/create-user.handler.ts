import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../commands/create-user.command';
import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { Result } from '../../../domain/result';
import * as bcrypt from 'bcryptjs';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<string>> {
    const { props } = command;

    // 1. Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(props.email);
    if (existingUser) {
      return Result.fail('El usuario con este email ya existe.');
    }

    // 2. Hashear la contraseña
    if (!props.password) {
      return Result.fail('La contraseña es obligatoria.');
    }
    const hashedPassword = await bcrypt.hash(props.password, 10);

    // 3. Crear la entidad de dominio
    const userResult = User.create({
      ...props,
      password: hashedPassword,
    });

    if (userResult.isFailure) {
      return Result.fail(userResult.error || 'Error desconocido al crear el usuario.');
    }

    const user = userResult.getValue();

    // 4. Persistir
    try {
      await this.userRepository.save(user);
      return Result.ok(user.id);
    } catch (error) {
      return Result.fail('Error al guardar el usuario en la base de datos.');
    }
  }
}
