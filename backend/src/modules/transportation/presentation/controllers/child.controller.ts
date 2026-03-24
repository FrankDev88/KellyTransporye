import { Controller, Post, Get, Body, UsePipes, HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfirmAbsenceDto } from '../dtos/attendance.dto';
import { CreateChildDto } from '../dtos/child.dto';

// Commands
import { ConfirmAbsenceCommand } from '../../application/child/commands/confirm-absence.command';
import { CreateChildCommand } from '../../application/child/commands/create-child.command';

// Queries
import { GetAllChildrenQuery } from '../../application/child/queries/get-all-children.query';

import { Result } from '../../domain/result';
import { Child } from '../../domain/entities/child.entity';

@ApiTags('Children Management')
@ApiBearerAuth('JWT-auth')
@Controller('transportation/child')
export class ChildController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los niños registrados (Get All Children)',
    description: '🔐 **Roles Permitidos:** `ADMIN`, `DRIVER`\n\nRetorna la lista completa de menores registrados en el sistema con todos sus atributos.'
  })
  @ApiResponse({ status: 200, description: 'Lista de niños obtenida correctamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado: Token JWT ausente o inválido.' })
  async getChildren() {
    const result: Result<Child[]> = await this.queryBus.execute(new GetAllChildrenQuery());
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, data: result.getValue() };
  }

  @Post()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Dar de alta a un niño (Create Child)',
    description: '🔐 **Roles Permitidos:** `ADMIN`\n\nRegistra a un nuevo menor en el sistema vinculándolo a un padre y asignándole un identificador de QR único para su gafete.'
  })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({ status: 201, description: 'Niño registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error de validación o datos de negocio inválidos (ej. QR duplicado).' })
  @ApiResponse({ status: 401, description: 'No autorizado: Token JWT ausente o inválido.' })
  async createChild(@Body() dto: CreateChildDto) {
    const result: Result<string> = await this.commandBus.execute(
      new CreateChildCommand(
        dto.firstName,
        dto.lastName,
        dto.parentId,
        dto.qrIdentifier,
        dto.homeAddress,
        { latitude: dto.latitude, longitude: dto.longitude },
        dto.photoUrl
      )
    );
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Niño registrado exitosamente.', childId: result.getValue() };
  }

  @Post('confirm-absence')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Confirmar Inasistencia',
    description: '🔐 **Roles Permitidos:** `ADMIN`, `PARENT`\n\nEl administrador o padre marca a un niño como inasistente previo al viaje. Dispara el recálculo de la ruta para omitir esa parada y actualizar los ETAs.'
  })
  @ApiResponse({ status: 201, description: 'Inasistencia confirmada y parada omitida del trazo.' })
  @ApiResponse({ status: 400, description: 'Error de negocio: El niño ya se encuentra a bordo o el viaje es inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado: Token JWT ausente o inválido.' })
  @ApiResponse({ status: 404, description: 'No encontrado: El niño o el viaje especificado no existen.' })
  async confirmAbsence(@Body() dto: ConfirmAbsenceDto) {
    const result: Result<void> = await this.commandBus.execute(new ConfirmAbsenceCommand(dto.childId, dto.reason, dto.tripId));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Inasistencia confirmada y ruta recalculada.' };
  }
}
