import { AttendanceLog, AttendanceMethod } from '../../../domain/entities/attendance-log.entity';
import { TypeOrmAttendanceLogEntity } from '../entities/attendance-log.entity';

export class AttendanceLogMapper {
  static toDomain(raw: TypeOrmAttendanceLogEntity): AttendanceLog {
    return new AttendanceLog({
      id: raw.id,
      childId: raw.childId,
      tripId: raw.tripId,
      driverId: raw.authorizedBy,
      method: raw.method as AttendanceMethod,
      location: this.mapPointToGpsPoint(raw.gpsLocation),
      reason: raw.notes,
      timestamp: raw.recordedAt,
    });
  }

  static toPersistence(log: AttendanceLog): Partial<TypeOrmAttendanceLogEntity> {
    return {
      id: log.id,
      childId: log.childId,
      tripId: log.tripId,
      method: log.method,
      notes: log.reason,
    };
  }

  private static mapPointToGpsPoint(point: any) {
    if (!point) return { latitude: 0, longitude: 0 };
    if (typeof point === 'string') {
      const parts = point.replace(/[()]/g, '').split(',');
      return { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
    }
    return { latitude: point.x || 0, longitude: point.y || 0 };
  }
}
