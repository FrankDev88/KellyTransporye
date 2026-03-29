import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { CreateTripCommand } from '../commands/create-trip.command';
import { Trip } from '../../../domain/entities/trip.entity';

@CommandHandler(CreateTripCommand)
export class CreateTripHandler implements ICommandHandler<CreateTripCommand, Result<string>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: CreateTripCommand): Promise<Result<string>> {
    const { templateId, driverId, scheduledStart } = command;

    try {
      await this.uow.startTransaction();

      const template = await this.uow.routeTemplateRepository.findById(templateId);
      if (!template) {
        await this.uow.rollback();
        return Result.fail('La plantilla de ruta especificada no existe.');
      }

      const assignedDriverId = driverId || template.defaultDriverId;
      if (!assignedDriverId) {
        await this.uow.rollback();
        return Result.fail('Se requiere un driverId o que la plantilla especifique un defaultDriverId.');
      }

      const tripId = randomUUID();
      const trip = new Trip({
        id: tripId,
        templateId,
        driverId: assignedDriverId,
        scheduledStart: scheduledStart || new Date(),
        isActive: false,
        exceptions: [],
      });

      await this.uow.tripRepository.save(trip);
      
      await this.uow.complete();
      return Result.ok<string>(tripId);

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Ocurrió un error inesperado al crear el viaje.');
    }
  }
}
