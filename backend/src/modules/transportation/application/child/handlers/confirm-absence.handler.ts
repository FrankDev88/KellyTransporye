import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { ConfirmAbsenceCommand } from '../commands/confirm-absence.command';
import { TripException } from '../../../domain/entities/trip.entity';

@CommandHandler(ConfirmAbsenceCommand)
export class ConfirmAbsenceHandler implements ICommandHandler<ConfirmAbsenceCommand, Result<void>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: ConfirmAbsenceCommand): Promise<Result<void>> {
    const { childId, reason, tripId } = command;

    try {
      await this.uow.startTransaction();

      const child = await this.uow.childRepository.findById(childId);
      if (!child) {
        await this.uow.rollback();
        return Result.fail(`No se encontró el niño con ID: ${childId}`);
      }

      const trip = await this.uow.tripRepository.findById(tripId);
      if (!trip) {
        await this.uow.rollback();
        return Result.fail('No se encontró el viaje especificado.');
      }

      try {
        child.confirmAbsence();
      } catch (domainError: any) {
        await this.uow.rollback();
        return Result.fail(domainError.message);
      }

      // Crear la excepción en el viaje
      const exception = new TripException({
        id: crypto.randomUUID(),
        tripId: tripId,
        childId: childId,
        exceptionType: child.status,
        reason: reason,
        createdAt: new Date(),
      });

      try {
        trip.addException(exception);
      } catch (error: any) {
        await this.uow.rollback();
        return Result.fail(error.message);
      }

      await this.uow.childRepository.save(child);
      await this.uow.tripRepository.save(trip);
      
      await this.uow.complete();
      return Result.ok<void>();

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Error al procesar la confirmación de inasistencia.');
    }
  }
}
