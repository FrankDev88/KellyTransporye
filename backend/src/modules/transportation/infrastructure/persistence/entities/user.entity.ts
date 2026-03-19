import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { UserRole } from '../../../domain/entities/user.entity';

@Entity('users')
export class TypeOrmUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'phone_number', type: 'text', nullable: true })
  phoneNumber: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
