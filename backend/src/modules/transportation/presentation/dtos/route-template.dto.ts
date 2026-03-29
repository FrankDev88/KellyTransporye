import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CreateRouteTemplateSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['HOME_TO_SCHOOL', 'SCHOOL_TO_HOME']),
  defaultDriverId: z.string().uuid().optional(),
  estimatedDuration: z.string().optional(),
  childrenIds: z.array(z.string().uuid()),
});

export class CreateRouteTemplateDto extends createZodDto(CreateRouteTemplateSchema) {
  @ApiProperty({ 
    example: 'Ruta 05 - Sector Norte', 
    description: 'Nombre descriptivo de la plantilla de ruta (mínimo 3 caracteres).',
    minLength: 3
  })
  name: string;

  @ApiProperty({ 
    enum: ['HOME_TO_SCHOOL', 'SCHOOL_TO_HOME'], 
    description: 'Tipo de trayecto: Recogida hacia la escuela o entrega hacia las casas.',
    example: 'HOME_TO_SCHOOL'
  })
  type: 'HOME_TO_SCHOOL' | 'SCHOOL_TO_HOME';

  @ApiPropertyOptional({ 
    example: '45 minutes', 
    description: 'Duración estimada del trayecto (formato de intervalo aceptado por PostgreSQL).' 
  })
  estimatedDuration?: string;

  @ApiPropertyOptional({ 
    example: 'dddd1111-1111-1111-1111-111111111111', 
    description: 'ID de conductor por defecto. Se usará al crear un viaje si no se asigna uno.',
    format: 'uuid'
  })
  defaultDriverId?: string;

  @ApiProperty({ 
    example: ['cccc1111-1111-1111-1111-111111111111', 'cccc2222-2222-2222-2222-222222222222'], 
    description: 'Lista ordenada de IDs de niños que pertenecen a esta ruta para el trazado del mapa.',
    type: [String]
  })
  childrenIds: string[];
}
