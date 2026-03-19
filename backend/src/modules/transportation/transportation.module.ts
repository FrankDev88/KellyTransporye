import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Dominio (Tokens)
import { UNIT_OF_WORK } from './domain/repositories/unit-of-work.interface';
import { CHILD_REPOSITORY } from './domain/repositories/child.repository.interface';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { ROUTE_TEMPLATE_REPOSITORY } from './domain/repositories/route-template.repository.interface';
import { TRIP_REPOSITORY } from './domain/repositories/trip.repository.interface';
import { ATTENDANCE_LOG_REPOSITORY } from './domain/repositories/attendance-log.repository.interface';

// Infraestructura (Implementaciones)
import { PostgresUnitOfWork } from './infrastructure/persistence/repositories/postgres-unit-of-work';
import { PostgresChildRepository } from './infrastructure/persistence/repositories/postgres-child.repository';
import { PostgresUserRepository } from './infrastructure/persistence/repositories/postgres-user.repository';
import { PostgresRouteTemplateRepository } from './infrastructure/persistence/repositories/postgres-route-template.repository';
import { PostgresTripRepository } from './infrastructure/persistence/repositories/postgres-trip.repository';
import { PostgresAttendanceLogRepository } from './infrastructure/persistence/repositories/postgres-attendance-log.repository';

// Aplicación (Handlers)
import { ScanQrAttendanceHandler } from './application/attendance/handlers/scan-qr-attendance.handler';
import { RegisterManualAttendanceHandler } from './application/attendance/handlers/register-manual-attendance.handler';
import { CheckOutAttendanceHandler } from './application/attendance/handlers/check-out-attendance.handler';
import { RegisterManualCheckOutHandler } from './application/attendance/handlers/register-manual-check-out.handler';
import { ConfirmAbsenceHandler } from './application/child/handlers/confirm-absence.handler';
import { StartTripHandler } from './application/route/handlers/start-trip.handler';
import { GetTripStopsHandler } from './application/route/handlers/get-trip-stops.handler';
import { GetAllTripsHandler } from './application/route/handlers/get-all-trips.handler';
import { CreateRouteTemplateHandler } from './application/route/handlers/create-route-template.handler';

// Presentación (Controladores)
import { RouteController } from './presentation/controllers/route.controller';
import { AttendanceController } from './presentation/controllers/attendance.controller';
import { ChildController } from './presentation/controllers/child.controller';

const InfrastructureProviders: Provider[] = [
  {
    provide: CHILD_REPOSITORY,
    useClass: PostgresChildRepository,
  },
  {
    provide: USER_REPOSITORY,
    useClass: PostgresUserRepository,
  },
  {
    provide: ROUTE_TEMPLATE_REPOSITORY,
    useClass: PostgresRouteTemplateRepository,
  },
  {
    provide: TRIP_REPOSITORY,
    useClass: PostgresTripRepository,
  },
  {
    provide: ATTENDANCE_LOG_REPOSITORY,
    useClass: PostgresAttendanceLogRepository,
  },
  {
    provide: UNIT_OF_WORK,
    useClass: PostgresUnitOfWork,
  },
];

const ApplicationHandlers = [
  ScanQrAttendanceHandler,
  RegisterManualAttendanceHandler,
  CheckOutAttendanceHandler,
  RegisterManualCheckOutHandler,
  ConfirmAbsenceHandler,
  StartTripHandler,
  GetTripStopsHandler,
  GetAllTripsHandler,
  CreateRouteTemplateHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [RouteController, AttendanceController, ChildController],
  providers: [
    ...InfrastructureProviders,
    ...ApplicationHandlers,
  ],
})
export class TransportationModule {}
