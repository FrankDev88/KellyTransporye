import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CreateChildSchema = z.object({
  firstName: z.string().min(1, { message: 'El nombre es obligatorio.' }),
  lastName: z.string().min(1, { message: 'El apellido es obligatorio.' }),
  parentId: z.string().uuid({ message: 'El ID del padre debe ser un UUID válido.' }),
  qrIdentifier: z.string().uuid({ message: 'El identificador de QR debe ser un UUID válido.' }),
  homeAddress: z.string().min(5, { message: 'La dirección debe ser detallada.' }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photoUrl: z.string().url().optional(),
});

export class CreateChildDto extends createZodDto(CreateChildSchema) {
  @ApiProperty({ 
    example: 'Mateo', 
    description: 'Nombre del niño',
    minLength: 1
  })
  firstName: string;

  @ApiProperty({ 
    example: 'García', 
    description: 'Apellido del niño',
    minLength: 1
  })
  lastName: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000', 
    description: 'UUID del usuario con rol PARENT asociado al niño',
    format: 'uuid'
  })
  parentId: string;

  @ApiProperty({ 
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    description: 'UUID único impreso en el código QR del gafete físico',
    format: 'uuid'
  })
  qrIdentifier: string;

  @ApiProperty({ 
    example: 'Av. Reforma 123, Col. Centro', 
    description: 'Dirección completa de la residencia para recogida/entrega',
    minLength: 5
  })
  homeAddress: string;

  @ApiProperty({ 
    example: 19.4326, 
    description: 'Latitud geográfica de la casa del niño',
    minimum: -90,
    maximum: 90
  })
  latitude: number;

  @ApiProperty({ 
    example: -99.1332, 
    description: 'Longitud geográfica de la casa del niño',
    minimum: -180,
    maximum: 180
  })
  longitude: number;

  @ApiPropertyOptional({ 
    example: 'https://cdn.example.com/photos/child1.jpg', 
    description: 'URL de la fotografía del menor para validación visual',
    format: 'url'
  })
  photoUrl?: string;
}
