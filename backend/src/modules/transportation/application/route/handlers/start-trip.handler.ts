import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { StartTripCommand } from '../commands/start-trip.command';

@CommandHandler(StartTripCommand)
export class StartTripHandler implements ICommandHandler<StartTripCommand, Result<void>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: StartTripCommand): Promise<Result<void>> {
    const { tripId, driverId } = command;

    try {
      await this.uow.startTransaction();

      // Verificar si el chofer ya tiene un viaje activo
      const activeTrip = await this.uow.tripRepository.findActiveByDriver(driverId);
      if (activeTrip && activeTrip.id !== tripId) {
        await this.uow.rollback();
        return Result.fail('Ya tienes un viaje en curso. Finaliza el actual antes de iniciar otro.');
      }

      const trip = await this.uow.tripRepository.findById(tripId);
      if (!trip) {
        await this.uow.rollback();
        return Result.fail('El viaje especificado no existe.');
      }

      if (trip.driverId && trip.driverId !== driverId) {
        await this.uow.rollback();
        return Result.fail('Este viaje está asignado a otro conductor.');
      }

      try {
        trip.start();
      } catch (domainError: any) {
        await this.uow.rollback();
        return Result.fail(domainError.message);
      }

      await this.uow.tripRepository.save(trip);
      
      await this.uow.complete();
      return Result.ok<void>();

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Ocurrió un error inesperado al iniciar el viaje.');
    }
  }
}
