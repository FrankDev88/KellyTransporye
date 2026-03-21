import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const ScanQrSchema = z.object({
  qrIdentifier: z.string().uuid({ message: 'El identificador de QR debe ser un UUID válido.' }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  driverId: z.string().uuid(),
});

export class ScanQrDto extends createZodDto(ScanQrSchema) {
  @ApiProperty({ 
    example: '11111111-cccc-1111-1111-111111111111', 
    description: 'UUID extraído del código QR del gafete del niño.',
    format: 'uuid'
  })
  qrIdentifier: string;

  @ApiProperty({ 
    example: 19.4326, 
    description: 'Latitud actual del autobús (obtenida por GPS).',
    minimum: -90,
    maximum: 90
  })
  latitude: number;

  @ApiProperty({ 
    example: -99.1332, 
    description: 'Longitud actual del autobús (obtenida por GPS).',
    minimum: -180,
    maximum: 180
  })
  longitude: number;

  @ApiProperty({ 
    example: 'dddd1111-1111-1111-1111-111111111111', 
    description: 'ID del conductor que realiza el escaneo.',
    format: 'uuid'
  })
  driverId: string;
}

export const ManualAttendanceSchema = z.object({
  childId: z.string().uuid(),
  driverId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  reason: z.enum(['Extravío', 'Daño', 'Olvido']),
});

export class ManualAttendanceDto extends createZodDto(ManualAttendanceSchema) {
  @ApiProperty({ 
    example: 'cccc1111-1111-1111-1111-111111111111', 
    description: 'ID único del niño seleccionado de la lista.',
    format: 'uuid'
  })
  childId: string;

  @ApiProperty({ 
    example: 'dddd1111-1111-1111-1111-111111111111',
    description: 'ID del conductor que autoriza el abordaje manual.',
    format: 'uuid'
  })
  driverId: string;

  @ApiProperty({ 
    example: 19.4326,
    description: 'Latitud actual del autobús.',
    minimum: -90,
    maximum: 90
  })
  latitude: number;

  @ApiProperty({ 
    example: -99.1332,
    description: 'Longitud actual del autobús.',
    minimum: -180,
    maximum: 180
  })
  longitude: number;

  @ApiProperty({ 
    enum: ['Extravío', 'Daño', 'Olvido'], 
    description: 'Motivo por el cual no se utilizó el código QR conforme al protocolo de contingencia.' 
  })
  reason: 'Extravío' | 'Daño' | 'Olvido';
}

export const CheckOutSchema = z.object({
  childId: z.string().uuid(),
  driverId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export class CheckOutDto extends createZodDto(CheckOutSchema) {
  @ApiProperty({ 
    example: 'cccc1111-1111-1111-1111-111111111111',
    description: 'ID del niño que se entrega.',
    format: 'uuid'
  })
  childId: string;

  @ApiProperty({ 
    example: 'dddd1111-1111-1111-1111-111111111111',
    description: 'ID del conductor que realiza la entrega.',
    format: 'uuid'
  })
  driverId: string;

  @ApiProperty({ 
    example: 19.4350, 
    description: 'Latitud en el punto de entrega (Casa/Escuela).',
    minimum: -90,
    maximum: 90
  })
  latitude: number;

  @ApiProperty({ 
    example: -99.1410, 
    description: 'Longitud en el punto de entrega (Casa/Escuela).',
    minimum: -180,
    maximum: 180
  })
  longitude: number;
}

export const ManualCheckOutSchema = z.object({
  childId: z.string().uuid(),
  driverId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  reason: z.enum(['Extravío', 'Daño', 'Olvido']),
});

export class ManualCheckOutDto extends createZodDto(ManualCheckOutSchema) {
  @ApiProperty({ 
    example: 'cccc1111-1111-1111-1111-111111111111',
    description: 'ID del niño que se entrega manualmente.',
    format: 'uuid'
  })
  childId: string;

  @ApiProperty({ 
    example: 'dddd1111-1111-1111-1111-111111111111',
    description: 'ID del conductor que autoriza la entrega manual.',
    format: 'uuid'
  })
  driverId: string;

  @ApiProperty({ 
    example: 19.4350,
    description: 'Latitud en el punto de entrega.',
    minimum: -90,
    maximum: 90
  })
  latitude: number;

  @ApiProperty({ 
    example: -99.1410,
    description: 'Longitud en el punto de entrega.',
    minimum: -180,
    maximum: 180
  })
  longitude: number;

  @ApiProperty({ 
    enum: ['Extravío', 'Daño', 'Olvido'],
    description: 'Motivo de la entrega manual.'
  })
  reason: 'Extravío' | 'Daño' | 'Olvido';
}

export const ConfirmAbsenceSchema = z.object({
  childId: z.string().uuid(),
  reason: z.string().min(5, 'Debe especificar un motivo válido de inasistencia.'),
  tripId: z.string().uuid(),
});

export class ConfirmAbsenceDto extends createZodDto(ConfirmAbsenceSchema) {
  @ApiProperty({ 
    example: 'cccc1111-1111-1111-1111-111111111111', 
    description: 'ID del niño que no asistirá.',
    format: 'uuid'
  })
  childId: string;

  @ApiProperty({ 
    example: 'Enfermedad: El padre llamó por la mañana.', 
    description: 'Justificación de la inasistencia (Mínimo 5 caracteres).',
    minLength: 5
  })
  reason: string;

  @ApiProperty({ 
    example: 'bbbb1111-1111-1111-1111-111111111111', 
    description: 'ID del viaje específico donde se aplicará la excepción.',
    format: 'uuid'
  })
  tripId: string;
}
