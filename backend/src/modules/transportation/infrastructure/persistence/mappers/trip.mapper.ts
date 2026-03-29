import { Trip, TripException } from '../../../domain/entities/trip.entity';
import { TypeOrmTripEntity } from '../entities/trip.entity';
import { TypeOrmTripExceptionEntity } from '../entities/trip-exception.entity';
import { ChildStatus } from '../../../domain/entities/child.entity';

export class TripMapper {
  static toDomain(raw: TypeOrmTripEntity): Trip {
    const exceptions = (raw.exceptions || []).map(excRaw => new TripException({
      id: excRaw.id,
      tripId: excRaw.tripId,
      childId: excRaw.childId,
      exceptionType: excRaw.exceptionType as ChildStatus,
      reason: excRaw.reason,
      createdAt: excRaw.createdAt,
    }));

    return new Trip({
      id: raw.id,
      templateId: raw.templateId,
      driverId: raw.driverId,
      scheduledStart: raw.scheduledStart,
      actualStart: raw.actualStart,
      actualEnd: raw.actualEnd,
      isActive: raw.isActive,
      exceptions: exceptions,
    });
  }

  static toPersistence(trip: Trip): Partial<TypeOrmTripEntity> {
    const exceptions: Partial<TypeOrmTripExceptionEntity>[] = trip.exceptions.map(exc => ({
      id: exc.id,
      tripId: exc.tripId,
      childId: exc.childId,
      exceptionType: exc.exceptionType,
      reason: exc.reason || null,
    }));

    return {
      id: trip.id,
      templateId: trip.templateId,
      driverId: trip.driverId || null,
      scheduledStart: trip.scheduledStart,
      actualStart: trip.actualStart,
      actualEnd: trip.actualEnd,
      isActive: trip.isActive,
      exceptions: exceptions as any,
    };
  }
}
