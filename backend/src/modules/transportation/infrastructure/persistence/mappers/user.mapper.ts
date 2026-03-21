import { User, UserRole } from '../../../domain/entities/user.entity';
import { TypeOrmUserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(raw: TypeOrmUserEntity): User {
    return new User({
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName,
      role: raw.role as UserRole,
      password: raw.passwordHash,
      phoneNumber: raw.phoneNumber,
      createdAt: raw.createdAt,
      isActive: true, // Asumimos true por defecto si no está en la BD o lo manejamos según lógica
    });
  }

  static toPersistence(user: User): Partial<TypeOrmUserEntity> {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      passwordHash: user.password,
      phoneNumber: user.phoneNumber,
    };
  }
}
