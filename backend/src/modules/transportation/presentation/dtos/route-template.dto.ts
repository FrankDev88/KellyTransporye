import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateRouteTemplateSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['HOME_TO_SCHOOL', 'SCHOOL_TO_HOME']),
  estimatedDuration: z.string().optional(),
  childrenIds: z.array(z.string().uuid()),
});

export class CreateRouteTemplateDto extends createZodDto(CreateRouteTemplateSchema) {
  @ApiProperty({ example: 'Ruta 05 - Sector Norte', description: 'Nombre descriptivo de la plantilla.' })
  name: string;

  @ApiProperty({ enum: ['HOME_TO_SCHOOL', 'SCHOOL_TO_HOME'], description: 'Tipo de trayecto (Hacia la escuela o hacia las casas).' })
  type: 'HOME_TO_SCHOOL' | 'SCHOOL_TO_HOME';

  @ApiProperty({ example: '45 minutes', description: 'Duración estimada del trayecto (formato intervalo Postgres).' })
  estimatedDuration: string;

  @ApiProperty({ 
    example: ['cccc1111-1111-1111-1111-111111111111', 'cccc2222-2222-2222-2222-222222222222'], 
    description: 'Lista ordenada de IDs de niños que pertenecen a esta ruta.',
    type: [String]
  })
  childrenIds: string[];
}
