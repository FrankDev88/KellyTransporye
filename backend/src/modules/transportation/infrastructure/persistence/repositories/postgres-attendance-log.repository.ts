import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AttendanceLogRepository } from '../../../domain/repositories/attendance-log.repository.interface';
import { AttendanceLog } from '../../../domain/entities/attendance-log.entity';
import { AttendanceLogMapper } from '../mappers/attendance-log.mapper';
import { TypeOrmAttendanceLogEntity } from '../entities/attendance-log.entity';

@Injectable()
export class PostgresAttendanceLogRepository implements AttendanceLogRepository {
  constructor(private readonly dataSource: DataSource, private readonly txManager?: EntityManager) {}

  private get manager(): EntityManager {
    return this.txManager || this.dataSource.manager;
  }

  async findByChild(childId: string): Promise<AttendanceLog[]> {
    const rawList = await this.manager.find(TypeOrmAttendanceLogEntity, { where: { childId } });
    return rawList.map(raw => AttendanceLogMapper.toDomain(raw));
  }

  async findByTrip(tripId: string): Promise<AttendanceLog[]> {
    const rawList = await this.manager.find(TypeOrmAttendanceLogEntity, { where: { tripId } });
    return rawList.map(raw => AttendanceLogMapper.toDomain(raw));
  }

  async save(log: AttendanceLog): Promise<void> {
    const persistenceData = AttendanceLogMapper.toPersistence(log);
    await this.manager.save(TypeOrmAttendanceLogEntity, persistenceData);
  }
}
