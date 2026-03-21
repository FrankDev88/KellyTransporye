import { Result } from '../result';
import { randomUUID } from 'crypto';

export enum UserRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PARENT = 'PARENT',
}

export interface UserProps {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateUserProps {
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
  phoneNumber?: string;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string { return this.props.id; }
  get email(): string { return this.props.email; }
  get fullName(): string { return this.props.fullName; }
  get role(): UserRole { return this.props.role; }
  get password(): string | undefined { return this.props.password; }
  get phoneNumber(): string | undefined { return this.props.phoneNumber; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isDriver(): boolean {
    return this.props.role === UserRole.DRIVER;
  }

  isParent(): boolean {
    return this.props.role === UserRole.PARENT;
  }

  static create(props: CreateUserProps): Result<User> {
    if (!props.email || !props.email.includes('@')) {
      return Result.fail('Email inválido.');
    }
    if (!props.fullName || props.fullName.trim().length < 3) {
      return Result.fail('Nombre completo inválido (mínimo 3 caracteres).');
    }
    if (!props.role) {
      return Result.fail('El rol es obligatorio.');
    }

    const user = new User({
      id: randomUUID(),
      email: props.email,
      fullName: props.fullName,
      role: props.role,
      password: props.password,
      phoneNumber: props.phoneNumber,
      isActive: true,
      createdAt: new Date(),
    });

    return Result.ok(user);
  }
}
