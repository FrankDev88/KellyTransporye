import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria.' }),
});

export class LoginDto extends createZodDto(LoginSchema) {
  @ApiProperty({
    description: 'Correo electrónico registrado del usuario',
    example: 'admin@transporte.com',
    format: 'email'
  })
  email: string;

  @ApiProperty({
    description: 'Contraseña de acceso al sistema',
    example: 'MiSuperPassword123',
    minLength: 1
  })
  password: string;
}
