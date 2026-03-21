import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CreateTripSchema = z.object({
  templateId: z.string().uuid({ message: 'El ID de la plantilla debe ser un UUID válido.' }),
  driverId: z.string().uuid({ message: 'El ID del conductor debe ser un UUID válido.' }),
  scheduledStart: z.string().datetime({ message: 'La fecha programada debe tener un formato ISO 8601 válido.' }).optional(),
});

export class CreateTripDto extends createZodDto(CreateTripSchema) {
  @ApiProperty({
    description: 'ID de la plantilla de ruta (Route Template) que servirá de base',
    example: 'aaaa1111-1111-1111-1111-111111111111',
    format: 'uuid'
  })
  templateId: string;

  @ApiProperty({
    description: 'ID del conductor (User con rol DRIVER) asignado al viaje',
    example: 'dddd1111-1111-1111-1111-111111111111',
    format: 'uuid'
  })
  driverId: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora programada para el inicio del viaje',
    example: '2026-03-20T07:00:00Z',
    format: 'date-time'
  })
  scheduledStart?: string;
}

const GenerateDailyTripsSchema = z.object({
  targetDate: z.string().datetime({ message: 'La fecha objetivo debe tener un formato ISO 8601 válido.' }),
});

export class GenerateDailyTripsDto extends createZodDto(GenerateDailyTripsSchema) {
  @ApiProperty({
    description: 'Fecha para la cual se generarán masivamente los viajes diarios',
    example: '2026-03-20T00:00:00Z',
    format: 'date-time'
  })
  targetDate: string;
}
