import { Controller, Post, Body, UsePipes, HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfirmAbsenceDto } from '../dtos/attendance.dto';

// Commands
import { ConfirmAbsenceCommand } from '../../application/child/commands/confirm-absence.command';

import { Result } from '../../domain/result';

@ApiTags('4. Administración')
@Controller('transportation/child')
export class ChildController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('confirm-absence')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ 
    summary: 'Confirmar Inasistencia', 
    description: 'El administrador marca a un niño como inasistente previo al viaje. Dispara el recálculo de la ruta para omitir esa parada y actualizar los ETAs.' 
  })
  @ApiResponse({ status: 201, description: 'Inasistencia confirmada y parada omitida del trazo.' })
  @ApiResponse({ status: 400, description: 'El niño ya se encuentra a bordo o la ruta es inválida.' })
  async confirmAbsence(@Body() dto: ConfirmAbsenceDto) {
    const result: Result<void> = await this.commandBus.execute(new ConfirmAbsenceCommand(dto.childId, dto.reason, dto.tripId));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Inasistencia confirmada y ruta recalculada.' };
  }
}
