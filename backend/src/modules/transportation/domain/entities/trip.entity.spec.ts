import { Trip, TripException } from './trip.entity';
import { ChildStatus } from './child.entity';
import { randomUUID } from 'crypto';

describe('Trip Entity', () => {
  const tripProps = {
    id: randomUUID(),
    templateId: randomUUID(),
    driverId: randomUUID(),
    scheduledStart: new Date(),
    isActive: false,
    exceptions: [],
  };

  describe('start', () => {
    it('debería marcar el viaje como activo y registrar la hora de inicio', () => {
      const trip = new Trip({ ...tripProps });
      trip.start();
      
      expect(trip.isActive).toBe(true);
      expect(trip.actualStart).toBeInstanceOf(Date);
    });

    it('debería fallar si el viaje ya está activo', () => {
      const trip = new Trip({ ...tripProps });
      trip.start();
      expect(() => trip.start()).toThrow('El viaje ya está activo.');
    });
  });

  describe('end', () => {
    it('debería marcar el viaje como inactivo y registrar la hora de fin', () => {
      const trip = new Trip({ ...tripProps });
      trip.start();
      trip.end();
      
      expect(trip.isActive).toBe(false);
      expect(trip.actualEnd).toBeInstanceOf(Date);
    });

    it('debería fallar si intenta finalizar un viaje no iniciado', () => {
      const trip = new Trip({ ...tripProps });
      expect(() => trip.end()).toThrow('El viaje no está activo o ya ha finalizado.');
    });
  });

  describe('addException', () => {
    it('debería agregar una excepción al viaje', () => {
      const trip = new Trip({ ...tripProps });
      const exception = new TripException({
        id: randomUUID(),
        tripId: trip.id,
        childId: randomUUID(),
        exceptionType: ChildStatus.ABSENCE_CONFIRMED,
        createdAt: new Date(),
      });

      trip.addException(exception);
      expect(trip.exceptions).toHaveLength(1);
      expect(trip.exceptions[0].childId).toBe(exception.childId);
    });

    it('debería fallar si intenta agregar una excepción duplicada para el mismo niño', () => {
      const trip = new Trip({ ...tripProps });
      const childId = randomUUID();
      const exception = new TripException({
        id: randomUUID(),
        tripId: trip.id,
        childId,
        exceptionType: ChildStatus.ABSENCE_CONFIRMED,
        createdAt: new Date(),
      });

      trip.addException(exception);
      expect(() => trip.addException(exception)).toThrow('El niño ya cuenta con una excepción registrada para este viaje.');
    });
  });
});
