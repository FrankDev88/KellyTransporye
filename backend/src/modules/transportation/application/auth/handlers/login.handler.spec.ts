import { LoginHandler } from './login.handler';
import { LoginCommand } from '../commands/login.command';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../../domain/entities/user.entity';

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;
    mockJwtService = {
      sign: jest.fn(),
    } as any;
    handler = new LoginHandler(mockUserRepository, mockJwtService);
  });

  const command = new LoginCommand({
    email: 'admin@transporte.com',
    password: 'password123',
  });

  it('debería retornar un token si las credenciales son válidas', async () => {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const mockUser = User.create({
      email: 'admin@transporte.com',
      fullName: 'Admin',
      role: UserRole.ADMIN,
      password: hashedPassword,
    }).getValue();

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockJwtService.sign.mockReturnValue('mock-jwt-token');

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().accessToken).toBe('mock-jwt-token');
    expect(result.getValue().user.email).toBe(mockUser.email);
  });

  it('debería fallar si el usuario no existe', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Credenciales inválidas.');
  });

  it('debería fallar si la contraseña es incorrecta', async () => {
    const mockUser = User.create({
      email: 'admin@transporte.com',
      fullName: 'Admin',
      role: UserRole.ADMIN,
      password: 'different-password-hash',
    }).getValue();

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Credenciales inválidas.');
  });
});
