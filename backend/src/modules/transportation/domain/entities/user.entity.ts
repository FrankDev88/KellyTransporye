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
  phoneNumber?: string;
  createdAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string { return this.props.id; }
  get email(): string { return this.props.email; }
  get fullName(): string { return this.props.fullName; }
  get role(): UserRole { return this.props.role; }
  get phoneNumber(): string | undefined { return this.props.phoneNumber; }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isDriver(): boolean {
    return this.props.role === UserRole.DRIVER;
  }

  isParent(): boolean {
    return this.props.role === UserRole.PARENT;
  }
}
