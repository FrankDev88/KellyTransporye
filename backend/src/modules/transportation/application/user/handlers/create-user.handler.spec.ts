import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from '../commands/create-user.command';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserRole } from '../../../domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    handler = new CreateUserHandler(mockUserRepository);
  });

  const command = new CreateUserCommand({
    email: 'new@example.com',
    fullName: 'New User',
    role: UserRole.DRIVER,
    password: 'password123',
  });

  it('debería crear un usuario exitosamente si el email no existe', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue(undefined);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(command.props.email);
  });

  it('debería fallar si el usuario ya existe', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({} as any);

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('El usuario con este email ya existe.');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('debería hashear la contraseña antes de guardar', async () => {
    const bcryptSpy = jest.spyOn(bcrypt, 'hash');
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await handler.execute(command);

    expect(bcryptSpy).toHaveBeenCalledWith(command.props.password, 10);
  });
});
