import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const StartTripSchema = z.object({
  tripId: z.string().uuid(),
  driverId: z.string().uuid(),
});

export class StartTripDto extends createZodDto(StartTripSchema) {
  @ApiProperty({ example: 'bbbb1111-1111-1111-1111-111111111111', description: 'ID del viaje (trip) que se desea iniciar.' })
  tripId: string;

  @ApiProperty({ example: 'dddd1111-1111-1111-1111-111111111111', description: 'ID del conductor asignado para este viaje.' })
  driverId: string;
}
