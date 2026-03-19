import { Controller, Post, Body, UsePipes, HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ScanQrDto, ManualAttendanceDto, CheckOutDto, ManualCheckOutDto } from '../dtos/attendance.dto';

// Commands
import { ScanQrAttendanceCommand } from '../../application/attendance/commands/scan-qr-attendance.command';
import { RegisterManualAttendanceCommand } from '../../application/attendance/commands/register-manual-attendance.command';
import { CheckOutAttendanceCommand } from '../../application/attendance/commands/check-out-attendance.command';
import { RegisterManualCheckOutCommand } from '../../application/attendance/commands/register-manual-check-out.command';

import { Result } from '../../domain/result';

@Controller('transportation/attendance')
export class AttendanceController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags('2. Asistencia Estándar (QR)')
  @Post('scan')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ 
    summary: 'Check-In vía Código QR',
    description: 'Registra el abordaje del niño validando la lectura de su gafete QR. El autobús debe estar dentro de la geocerca permitida (50m).' 
  })
  @ApiResponse({ status: 201, description: 'Abordaje confirmado y registrado en auditoría.' })
  @ApiResponse({ status: 400, description: 'Fuera de geocerca, ruta inactiva o niño no pertenece a la ruta.' })
  async scanQr(@Body() dto: ScanQrDto) {
    const result: Result<void> = await this.commandBus.execute(new ScanQrAttendanceCommand(dto.qrIdentifier, dto.latitude, dto.longitude, dto.driverId));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Abordaje confirmado.' };
  }

  @ApiTags('2. Asistencia Estándar (QR)')
  @Post('checkout')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ 
    summary: 'Check-Out (Entrega de niño)', 
    description: 'Finaliza el viaje del niño al llegar a su destino (escuela o casa). Requiere que el estado previo del niño sea ON_BOARD y estar en zona.' 
  })
  @ApiResponse({ status: 201, description: 'Entrega confirmada correctamente.' })
  @ApiResponse({ status: 400, description: 'Error de flujo: El niño no ha abordado o está fuera de la geocerca.' })
  async checkOut(@Body() dto: CheckOutDto) {
    const result: Result<void> = await this.commandBus.execute(new CheckOutAttendanceCommand(dto.childId, dto.driverId, dto.latitude, dto.longitude));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Entrega confirmada correctamente.' };
  }

  @ApiTags('3. Contingencia (Gafete Perdido)')
  @Post('manual')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ 
    summary: 'Check-In Manual', 
    description: 'Protocolo especial para registrar el abordaje de un niño que no cuenta con su gafete QR. Exige registrar un motivo (Extravío, Daño, Olvido).' 
  })
  @ApiResponse({ status: 201, description: 'Asistencia manual registrada para auditoría.' })
  @ApiResponse({ status: 400, description: 'Datos insuficientes o fuera de geocerca.' })
  async manualAttendance(@Body() dto: ManualAttendanceDto) {
    const result: Result<void> = await this.commandBus.execute(new RegisterManualAttendanceCommand(dto.childId, dto.driverId, dto.latitude, dto.longitude, dto.reason as any));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Asistencia manual registrada.' };
  }

  @ApiTags('3. Contingencia (Gafete Perdido)')
  @Post('checkout/manual')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ 
    summary: 'Check-Out Manual', 
    description: 'Finaliza manualmente el viaje del niño que subió sin QR. Exige registrar el motivo de la operación para control estricto.' 
  })
  @ApiResponse({ status: 201, description: 'Entrega manual confirmada.' })
  @ApiResponse({ status: 400, description: 'Error de flujo o falta de motivo.' })
  async manualCheckOut(@Body() dto: ManualCheckOutDto) {
    const result: Result<void> = await this.commandBus.execute(new RegisterManualCheckOutCommand(dto.childId, dto.driverId, dto.latitude, dto.longitude, dto.reason as any));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Entrega manual confirmada correctamente.' };
  }
}
