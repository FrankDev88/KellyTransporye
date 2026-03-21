import { Child, ChildStatus } from './child.entity';
import { randomUUID } from 'crypto';

describe('Child Entity', () => {
  const validProps = {
    firstName: 'Mateo',
    lastName: 'García',
    parentId: randomUUID(),
    qrIdentifier: randomUUID(),
    homeAddress: 'Calle Falsa 123',
    homeLocation: { latitude: 19.4326, longitude: -99.1332 },
  };

  describe('create', () => {
    it('debería crear un niño con estado PENDING y activo por defecto', () => {
      const child = Child.create(validProps);

      expect(child.id).toBeDefined();
      expect(child.status).toBe(ChildStatus.PENDING);
      expect(child.isActive).toBe(true);
      expect(child.fullName).toBe('Mateo García');
    });

    it('debería lanzar un error si falta el nombre o apellido', () => {
      expect(() => Child.create({ ...validProps, firstName: '' })).toThrow('El nombre y el apellido son obligatorios.');
    });

    it('debería lanzar un error si falta el parentId', () => {
      expect(() => Child.create({ ...validProps, parentId: '' })).toThrow('El ID del padre es obligatorio.');
    });
  });

  describe('Reglas de Negocio: Check-In', () => {
    it('debería cambiar a ON_BOARD si el estado es PENDING', () => {
      const child = Child.create(validProps);
      child.checkIn();
      expect(child.status).toBe(ChildStatus.ON_BOARD);
    });

    it('debería fallar si el niño ya tiene inasistencia confirmada', () => {
      const child = Child.create(validProps);
      child.confirmAbsence();
      expect(() => child.checkIn()).toThrow('No se puede abordar a un niño con inasistencia confirmada.');
    });

    it('debería fallar si el niño ya está a bordo', () => {
      const child = Child.create(validProps);
      child.checkIn();
      expect(() => child.checkIn()).toThrow('El niño ya se encuentra a bordo.');
    });
  });

  describe('Reglas de Negocio: Check-Out', () => {
    it('debería cambiar a COMPLETED si el estado es ON_BOARD', () => {
      const child = Child.create(validProps);
      child.checkIn();
      child.checkOut();
      expect(child.status).toBe(ChildStatus.COMPLETED);
    });

    it('debería fallar si intenta hacer check-out sin haber abordado', () => {
      const child = Child.create(validProps);
      expect(() => child.checkOut()).toThrow('No se puede realizar Check-Out sin un Check-In previo.');
    });
  });

  describe('Geofencing', () => {
    it('debería retornar true si está dentro del radio de 50 metros', () => {
      const child = Child.create(validProps); // Ubicación: 19.4326, -99.1332
      const busLocation = { latitude: 19.4327, longitude: -99.1333 }; // Muy cerca (~15m)
      
      expect(child.isWithinGeofence(busLocation)).toBe(true);
    });

    it('debería retornar false si está fuera del radio de 50 metros', () => {
      const child = Child.create(validProps);
      const busLocation = { latitude: 19.4400, longitude: -99.1400 }; // Lejos (~1km)
      
      expect(child.isWithinGeofence(busLocation)).toBe(false);
    });
  });
});
