import { Controller, Post, Get, Param, Body, UsePipes, HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { StartTripDto } from '../dtos/start-trip.dto';
import { CreateRouteTemplateDto } from '../dtos/route-template.dto';

// Commands & Queries
import { StartTripCommand } from '../../application/route/commands/start-trip.command';
import { CreateRouteTemplateCommand } from '../../application/route/commands/create-route-template.command';
import { GetTripStopsQuery } from '../../application/route/queries/get-trip-stops.query';
import { GetAllTripsQuery } from '../../application/route/queries/get-all-trips.query';

import { Result } from '../../domain/result';
import { Trip } from '../../domain/entities/trip.entity';

@ApiTags('1. Planificación y Ejecución de Rutas')
@Controller('transportation/route')
export class RouteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('trips')
  @ApiOperation({ 
    summary: 'Obtener todos los viajes (Trips)',
    description: 'Retorna la lista completa de viajes ejecutados o programados en el sistema.'
  })
  @ApiResponse({ status: 200, description: 'Lista de viajes recuperada con éxito.' })
  async getTrips() {
    const result: Result<Trip[]> = await this.queryBus.execute(new GetAllTripsQuery());
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, data: result.getValue() };
  }

  @Post('template/create')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ 
    summary: 'Crear una nueva plantilla de ruta (Plan Maestro)',
    description: 'Genera la estructura estática de una ruta, definiendo su nombre, tipo y la lista ordenada de niños que pertenecen a ella. Esta plantilla servirá como base para generar los viajes diarios (Trips).' 
  })
  @ApiResponse({ status: 201, description: 'Plantilla de ruta creada exitosamente.', schema: { example: { success: true, templateId: 'uuid' } } })
  @ApiResponse({ status: 400, description: 'Error en la validación de los datos proporcionados.' })
  async createTemplate(@Body() dto: CreateRouteTemplateDto) {
    const result: Result<string> = await this.commandBus.execute(
      new CreateRouteTemplateCommand(
        dto.name,
        dto.type,
        dto.estimatedDuration,
        dto.childrenIds
      )
    );
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Plantilla creada exitosamente.', templateId: result.getValue() };
  }

  @Get('trip/:tripId/stops')
  @ApiOperation({ 
    summary: 'Obtener el listado de paradas en tiempo real de un viaje',
    description: 'Devuelve la lista secuencial de paradas para un viaje específico. Combina la información de la plantilla maestra con las excepciones actuales (inasistencias confirmadas) para mostrar el estado real del recorrido.'
  })
  @ApiParam({ name: 'tripId', type: 'string', description: 'ID del viaje (trip) en ejecución o programado.' })
  @ApiResponse({ status: 200, description: 'Listado de paradas recuperado con éxito.' })
  @ApiResponse({ status: 404, description: 'El viaje o la plantilla asociada no existen.' })
  async getTripStops(@Param('tripId') tripId: string) {
    const result: Result<any[]> = await this.queryBus.execute(new GetTripStopsQuery(tripId));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, data: result.getValue() };
  }

  @Post('trip/start')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ 
    summary: 'Iniciar un viaje (Trip Start)',
    description: 'Marca el inicio oficial de un viaje diario. Establece el estado del viaje como activo, registra la hora exacta de inicio (actualStart) y valida que el conductor no tenga otro viaje en curso.' 
  })
  @ApiResponse({ status: 201, description: 'Viaje activado correctamente.' })
  @ApiResponse({ status: 400, description: 'Error de negocio (ej. el conductor ya tiene un viaje activo).' })
  async startTrip(@Body() dto: StartTripDto) {
    const result: Result<void> = await this.commandBus.execute(new StartTripCommand(dto.tripId, dto.driverId));
    if (result.isFailure) throw new HttpException(result.error || 'Error', HttpStatus.BAD_REQUEST);
    return { success: true, message: 'Viaje iniciado.' };
  }
}
