import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { GetAllTripsQuery } from '../queries/get-all-trips.query';
import { Result } from '../../../domain/result';
import { Trip } from '../../../domain/entities/trip.entity';

@QueryHandler(GetAllTripsQuery)
export class GetAllTripsHandler implements IQueryHandler<GetAllTripsQuery, Result<Trip[]>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(query: GetAllTripsQuery): Promise<Result<Trip[]>> {
    try {
      const trips = await this.uow.tripRepository.findAll();
      return Result.ok(trips);
    } catch (error) {
      console.error(error);
      return Result.fail('Error al obtener la lista de viajes.');
    }
  }
}
