import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { GenerateDailyTripsCommand } from '../commands/generate-daily-trips.command';
import { Trip } from '../../../domain/entities/trip.entity';

@CommandHandler(GenerateDailyTripsCommand)
export class GenerateDailyTripsHandler implements ICommandHandler<GenerateDailyTripsCommand, Result<number>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: GenerateDailyTripsCommand): Promise<Result<number>> {
    const { targetDate } = command;

    try {
      await this.uow.startTransaction();

      const templates = await this.uow.routeTemplateRepository.findAll();
      let generatedCount = 0;

      for (const template of templates) {
        // En una implementación real más compleja, se podría validar si ya existe 
        // un viaje para esa plantilla en ese mismo día para no duplicar.
        
        // Si la plantilla tiene un conductor por defecto, se lo asignamos.
        // Si no, lo dejamos nulo para que sea asignado posteriormente.
        const driverIdToUse = template.defaultDriverId || null;

        const trip = new Trip({
          id: randomUUID(),
          templateId: template.id,
          driverId: driverIdToUse,
          scheduledStart: targetDate,
          isActive: false,
          exceptions: [],
        });

        await this.uow.tripRepository.save(trip);
        generatedCount++;
      }

      await this.uow.complete();
      return Result.ok<number>(generatedCount);

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Ocurrió un error inesperado al generar los viajes masivos.');
    }
  }
}
