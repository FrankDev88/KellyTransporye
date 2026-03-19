import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { AttendanceLog, AttendanceMethod } from '../../../domain/entities/attendance-log.entity';
import { RegisterManualAttendanceCommand } from '../commands/register-manual-attendance.command';

@CommandHandler(RegisterManualAttendanceCommand)
export class RegisterManualAttendanceHandler implements ICommandHandler<RegisterManualAttendanceCommand, Result<void>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: RegisterManualAttendanceCommand): Promise<Result<void>> {
    const { childId, driverId, latitude, longitude, reason } = command;

    try {
      await this.uow.startTransaction();

      const child = await this.uow.childRepository.findById(childId);
      if (!child) {
        await this.uow.rollback();
        return Result.fail(`No se encontró el niño con ID: ${childId}`);
      }

      const activeTrip = await this.uow.tripRepository.findActiveByDriver(driverId);
      if (!activeTrip) {
        await this.uow.rollback();
        return Result.fail('No tienes ningún viaje activo.');
      }

      // Verificar si el niño pertenece a la plantilla de este viaje
      const template = await this.uow.routeTemplateRepository.findById(activeTrip.templateId);
      const isChildInRoute = template?.stops.some(s => s.childId === child.id);
      if (!isChildInRoute) {
        await this.uow.rollback();
        return Result.fail('El niño no pertenece a tu ruta actual.');
      }

      const busLocation = { latitude, longitude };
      if (!child.isWithinGeofence(busLocation)) {
        await this.uow.rollback();
        return Result.fail('No puedes realizar abordaje manual: El bus está fuera del radio de 50m.');
      }

      try {
        child.checkIn();
      } catch (domainError: any) {
        await this.uow.rollback();
        return Result.fail(domainError.message);
      }

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
      return Result.fail('Error interno al registrar el abordaje manual.');
    }
  }
}
