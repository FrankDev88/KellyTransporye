import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { AttendanceLog, AttendanceMethod } from '../../../domain/entities/attendance-log.entity';
import { RegisterManualCheckOutCommand } from '../commands/register-manual-check-out.command';

@CommandHandler(RegisterManualCheckOutCommand)
export class RegisterManualCheckOutHandler implements ICommandHandler<RegisterManualCheckOutCommand, Result<void>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: RegisterManualCheckOutCommand): Promise<Result<void>> {
    const { childId, driverId, latitude, longitude, reason } = command;

    try {
      await this.uow.startTransaction();

      const child = await this.uow.childRepository.findById(childId);
      if (!child) {
        await this.uow.rollback();
        return Result.fail('Niño no encontrado.');
      }

      const activeTrip = await this.uow.tripRepository.findActiveByDriver(driverId);
      if (!activeTrip) {
        await this.uow.rollback();
        return Result.fail('No tienes un viaje activo.');
      }

      // Validar Geocerca de Entrega (50m)
      const busLocation = { latitude, longitude };
      if (!child.isWithinGeofence(busLocation)) {
        await this.uow.rollback();
        return Result.fail('Fuera de rango para Check-out.');
      }

      // DOMINIO: Cambiar estado a COMPLETED
      try {
        child.checkOut(); // Lanza error si no hubo check-in previo (estado ON_BOARD)
      } catch (domainError: any) {
        await this.uow.rollback();
        return Result.fail(domainError.message);
      }

      // AUDITORÍA
      const auditLog = new AttendanceLog({
        id: crypto.randomUUID(),
        childId: child.id,
        tripId: activeTrip.id,
        driverId: driverId,
        method: AttendanceMethod.MANUAL_BY_DRIVER,
        location: busLocation,
        reason: reason,
        timestamp: new Date(),
      });

      await this.uow.childRepository.save(child);
      await this.uow.attendanceLogRepository.save(auditLog);
      
      await this.uow.complete();
      return Result.ok<void>();

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Error al procesar el Check-out manual.');
    }
  }
}
