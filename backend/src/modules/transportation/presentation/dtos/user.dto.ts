import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserRole } from '../../domain/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CreateUserSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  fullName: z.string().min(3, { message: 'El nombre completo debe tener al menos 3 caracteres.' }),
  role: z.nativeEnum(UserRole, { message: 'Rol de usuario inválido.' }),
  phoneNumber: z.string().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {
  @ApiProperty({
    description: 'Correo electrónico único del usuario (servirá como login)',
    example: 'conductor.juan@transporte.com',
    format: 'email'
  })
  email: string;

  @ApiProperty({
    description: 'Contraseña de acceso cifrada con hash (mínimo 6 caracteres)',
    example: 'S3cureP@ss!',
    minLength: 6
  })
  password: string;

  @ApiProperty({
    description: 'Nombre y apellidos completos del usuario',
    example: 'Juan Pérez García',
    minLength: 3
  })
  fullName: string;

  @ApiProperty({
    description: 'Rol funcional asignado al usuario dentro del ecosistema',
    enum: UserRole,
    example: UserRole.DRIVER
  })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Número de teléfono de contacto para emergencias o coordinación',
    example: '+525512345678'
  })
  phoneNumber?: string;
}
