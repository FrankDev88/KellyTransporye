import { ScanQrAttendanceHandler } from './scan-qr-attendance.handler';
import { ScanQrAttendanceCommand } from '../commands/scan-qr-attendance.command';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Child, ChildStatus } from '../../../domain/entities/child.entity';
import { Trip } from '../../../domain/entities/trip.entity';
import { RouteTemplate } from '../../../domain/entities/route-template.entity';
import { randomUUID } from 'crypto';

describe('ScanQrAttendanceHandler', () => {
  let handler: ScanQrAttendanceHandler;
  let mockUow: jest.Mocked<UnitOfWork>;

  const childId = randomUUID();
  const tripId = randomUUID();
  const templateId = randomUUID();
  const driverId = randomUUID();
  const qrId = randomUUID();

  beforeEach(() => {
    mockUow = {
      startTransaction: jest.fn(),
      complete: jest.fn(),
      rollback: jest.fn(),
      childRepository: { findByQr: jest.fn(), save: jest.fn() },
      tripRepository: { findActiveByDriver: jest.fn() },
      routeTemplateRepository: { findById: jest.fn() },
      attendanceLogRepository: { save: jest.fn() },
    } as any;
    handler = new ScanQrAttendanceHandler(mockUow);
  });

  const command = new ScanQrAttendanceCommand(qrId, 19.4326, -99.1332, driverId);

  it('debería registrar asistencia exitosamente si todo es válido', async () => {
    const mockChild = new Child({
      id: childId,
      firstName: 'Mateo',
      lastName: 'García',
      qrIdentifier: qrId,
      parentId: randomUUID(),
      homeAddress: 'Casa',
      homeLocation: { latitude: 19.4326, longitude: -99.1332 },
      status: ChildStatus.PENDING,
      isActive: true,
    });

    const mockTrip = new Trip({
      id: tripId,
      templateId: templateId,
      driverId,
      scheduledStart: new Date(),
      isActive: true,
      exceptions: [],
    });

    const mockTemplate = new RouteTemplate({
      id: templateId,
      name: 'Ruta 1',
      type: 'HOME_TO_SCHOOL' as any,
      createdAt: new Date(),
      stops: [{ childId } as any],
    });

    (mockUow.childRepository.findByQr as jest.Mock).mockResolvedValue(mockChild);
    (mockUow.tripRepository.findActiveByDriver as jest.Mock).mockResolvedValue(mockTrip);
    (mockUow.routeTemplateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate);

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(mockChild.status).toBe(ChildStatus.ON_BOARD);
    expect(mockUow.complete).toHaveBeenCalled();
  });

  it('debería fallar si el niño está fuera de la geocerca', async () => {
    const mockChild = new Child({
      id: childId,
      firstName: 'Mateo',
      lastName: 'García',
      qrIdentifier: qrId,
      parentId: randomUUID(),
      homeAddress: 'Casa',
      homeLocation: { latitude: 25.0000, longitude: -100.0000 }, // Lejos de 19.4326
      status: ChildStatus.PENDING,
      isActive: true,
    });

    (mockUow.childRepository.findByQr as jest.Mock).mockResolvedValue(mockChild);
    (mockUow.tripRepository.findActiveByDriver as jest.Mock).mockResolvedValue({ templateId } as any);
    (mockUow.routeTemplateRepository.findById as jest.Mock).mockResolvedValue({ stops: [{ childId }] } as any);

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('demasiado lejos');
    expect(mockUow.rollback).toHaveBeenCalled();
  });

  it('debería fallar si el niño no pertenece a la ruta activa', async () => {
    const mockChild = { id: 'other-child-id' } as any;
    (mockUow.childRepository.findByQr as jest.Mock).mockResolvedValue(mockChild);
    (mockUow.tripRepository.findActiveByDriver as jest.Mock).mockResolvedValue({ templateId } as any);
    (mockUow.routeTemplateRepository.findById as jest.Mock).mockResolvedValue({ stops: [] } as any);

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('El niño no pertenece a tu ruta actual.');
  });
});
