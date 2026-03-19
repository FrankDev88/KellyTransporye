import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { ScanQrAttendanceCommand } from '../commands/scan-qr-attendance.command';
import { AttendanceLog, AttendanceMethod } from '../../../domain/entities/attendance-log.entity';

@CommandHandler(ScanQrAttendanceCommand)
export class ScanQrAttendanceHandler implements ICommandHandler<ScanQrAttendanceCommand, Result<void>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: ScanQrAttendanceCommand): Promise<Result<void>> {
    const { qrIdentifier, latitude, longitude, driverId } = command;

    try {
      await this.uow.startTransaction();

      const child = await this.uow.childRepository.findByQr(qrIdentifier);
      if (!child) {
        await this.uow.rollback();
        return Result.fail(`No se encontró ningún niño con el QR: ${qrIdentifier}`);
      }

      const activeTrip = await this.uow.tripRepository.findActiveByDriver(driverId);
      if (!activeTrip) {
        await this.uow.rollback();
        return Result.fail('No tienes ningún viaje activo en este momento.');
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
        return Result.fail('Estás demasiado lejos del punto de recogida para validar este abordaje (Radio > 50m).');
      }

      try {
        child.checkIn();
      } catch (domainError: any) {
        await this.uow.rollback();
        return Result.fail(domainError.message);
      }

      // Crear log de asistencia
      const log = new AttendanceLog({
        id: crypto.randomUUID(),
        childId: child.id,
        tripId: activeTrip.id,
        driverId: driverId,
        method: AttendanceMethod.QR_SCAN,
        location: busLocation,
        timestamp: new Date(),
      });

      await this.uow.childRepository.save(child);
      await this.uow.attendanceLogRepository.save(log);
      
      await this.uow.complete();
      return Result.ok<void>();

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Ocurrió un error inesperado al procesar la asistencia.');
    }
  }
}
