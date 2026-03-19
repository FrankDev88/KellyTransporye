import { AttendanceLog } from '../entities/attendance-log.entity';

export interface AttendanceLogRepository {
  save(log: AttendanceLog): Promise<void>;
  findByChild(childId: string): Promise<AttendanceLog[]>;
  findByTrip(tripId: string): Promise<AttendanceLog[]>;
}

export const ATTENDANCE_LOG_REPOSITORY = 'ATTENDANCE_LOG_REPOSITORY';
