import { ChildRepository } from './child.repository.interface';
import { RouteTemplateRepository } from './route-template.repository.interface';
import { TripRepository } from './trip.repository.interface';
import { UserRepository } from './user.repository.interface';
import { AttendanceLogRepository } from './attendance-log.repository.interface';

export interface UnitOfWork {
  childRepository: ChildRepository;
  routeTemplateRepository: RouteTemplateRepository;
  tripRepository: TripRepository;
  userRepository: UserRepository;
  attendanceLogRepository: AttendanceLogRepository;

  startTransaction(): Promise<void>;
  complete(): Promise<void>;
  rollback(): Promise<void>;
}

export const UNIT_OF_WORK = 'UNIT_OF_WORK';
