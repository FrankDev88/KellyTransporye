import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { GetTripStopsQuery } from '../queries/get-trip-stops.query';
import { Result } from '../../../domain/result';

@QueryHandler(GetTripStopsQuery)
export class GetTripStopsHandler implements IQueryHandler<GetTripStopsQuery, Result<any[]>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(query: GetTripStopsQuery): Promise<Result<any[]>> {
    const { tripId } = query;

    try {
      const trip = await this.uow.tripRepository.findById(tripId);
      if (!trip) {
        return Result.fail('No se encontró el viaje especificado.');
      }

      const template = await this.uow.routeTemplateRepository.findById(trip.templateId);
      if (!template) {
        return Result.fail('No se encontró la plantilla maestra asociada a este viaje.');
      }

      // Combinamos las paradas de la plantilla con las excepciones del viaje
      const stops = await Promise.all(template.stops.map(async (stop) => {
        const child = await this.uow.childRepository.findById(stop.childId);
        const exception = trip.exceptions.find(e => e.childId === stop.childId);
        
        return {
          id: stop.id,
          childId: stop.childId,
          childName: child ? child.fullName : 'Desconocido',
          stopOrder: stop.stopOrder,
          isSkipped: !!exception,
          skipReason: exception ? exception.reason : null,
          latitude: child ? child.homeLocation.latitude : 0,
          longitude: child ? child.homeLocation.longitude : 0,
          status: exception ? exception.exceptionType : (child ? child.status : 'PENDING'),
        };
      }));

      return Result.ok(stops);
    } catch (error) {
      console.error(error);
      return Result.fail('Error al obtener las paradas del viaje.');
    }
  }
}
