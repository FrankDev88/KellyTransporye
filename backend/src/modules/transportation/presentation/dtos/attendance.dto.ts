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
  @ApiProperty({ example: '11111111-cccc-1111-1111-111111111111', description: 'UUID extraído del código QR del gafete del niño.' })
  qrIdentifier: string;

  @ApiProperty({ example: 19.4326, description: 'Latitud actual del autobús (obtenida por GPS).' })
  latitude: number;

  @ApiProperty({ example: -99.1332, description: 'Longitud actual del autobús (obtenida por GPS).' })
  longitude: number;

  @ApiProperty({ example: 'dddd1111-1111-1111-1111-111111111111', description: 'ID del conductor que realiza el escaneo.' })
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
  @ApiProperty({ example: 'cccc1111-1111-1111-1111-111111111111', description: 'ID único del niño seleccionado de la lista.' })
  childId: string;

  @ApiProperty({ example: 'dddd1111-1111-1111-1111-111111111111' })
  driverId: string;

  @ApiProperty({ example: 19.4326 })
  latitude: number;

  @ApiProperty({ example: -99.1332 })
  longitude: number;

  @ApiProperty({ enum: ['Extravío', 'Daño', 'Olvido'], description: 'Motivo por el cual no se utilizó el código QR.' })
  reason: 'Extravío' | 'Daño' | 'Olvido';
}

export const CheckOutSchema = z.object({
  childId: z.string().uuid(),
  driverId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export class CheckOutDto extends createZodDto(CheckOutSchema) {
  @ApiProperty({ example: 'cccc1111-1111-1111-1111-111111111111' })
  childId: string;

  @ApiProperty({ example: 'dddd1111-1111-1111-1111-111111111111' })
  driverId: string;

  @ApiProperty({ example: 19.4350, description: 'Latitud en el punto de entrega (Casa/Escuela).' })
  latitude: number;

  @ApiProperty({ example: -99.1410, description: 'Longitud en el punto de entrega (Casa/Escuela).' })
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
  @ApiProperty({ example: 'cccc1111-1111-1111-1111-111111111111' })
  childId: string;

  @ApiProperty({ example: 'dddd1111-1111-1111-1111-111111111111' })
  driverId: string;

  @ApiProperty({ example: 19.4350 })
  latitude: number;

  @ApiProperty({ example: -99.1410 })
  longitude: number;

  @ApiProperty({ enum: ['Extravío', 'Daño', 'Olvido'] })
  reason: 'Extravío' | 'Daño' | 'Olvido';
}

export const ConfirmAbsenceSchema = z.object({
  childId: z.string().uuid(),
  reason: z.string().min(5, 'Debe especificar un motivo válido de inasistencia.'),
  tripId: z.string().uuid(),
});

export class ConfirmAbsenceDto extends createZodDto(ConfirmAbsenceSchema) {
  @ApiProperty({ example: 'cccc1111-1111-1111-1111-111111111111', description: 'ID del niño que no asistirá.' })
  childId: string;

  @ApiProperty({ example: 'Enfermedad: El padre llamó por la mañana.', description: 'Justificación de la inasistencia.' })
  reason: string;

  @ApiProperty({ example: 'bbbb1111-1111-1111-1111-111111111111', description: 'ID del viaje específico donde se aplicará la excepción.' })
  tripId: string;
}
