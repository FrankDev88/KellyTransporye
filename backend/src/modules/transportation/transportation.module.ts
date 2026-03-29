import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

// Aplicación (Handlers)
import { ScanQrAttendanceHandler } from './application/attendance/handlers/scan-qr-attendance.handler';
import { RegisterManualAttendanceHandler } from './application/attendance/handlers/register-manual-attendance.handler';
import { CheckOutAttendanceHandler } from './application/attendance/handlers/check-out-attendance.handler';
import { RegisterManualCheckOutHandler } from './application/attendance/handlers/register-manual-check-out.handler';
import { ConfirmAbsenceHandler } from './application/child/handlers/confirm-absence.handler';
import { CreateChildHandler } from './application/child/handlers/create-child.handler';
import { GetAllChildrenHandler } from './application/child/handlers/get-all-children.handler';
import { StartTripHandler } from './application/route/handlers/start-trip.handler';
import { GetTripStopsHandler } from './application/route/handlers/get-trip-stops.handler';
import { GetAllTripsHandler } from './application/route/handlers/get-all-trips.handler';
import { GetAllRouteTemplatesHandler } from './application/route/handlers/get-all-route-templates.handler';
import { CreateRouteTemplateHandler } from './application/route/handlers/create-route-template.handler';
import { CreateTripHandler } from './application/route/handlers/create-trip.handler';
import { GenerateDailyTripsHandler } from './application/route/handlers/generate-daily-trips.handler';
import { CreateUserHandler } from './application/user/handlers/create-user.handler';
import { GetAllUsersHandler } from './application/user/handlers/get-all-users.handler';
import { LoginHandler } from './application/auth/handlers/login.handler';

// Presentación (Controladores)
import { RouteController } from './presentation/controllers/route.controller';
import { AttendanceController } from './presentation/controllers/attendance.controller';
import { ChildController } from './presentation/controllers/child.controller';
import { UserController } from './presentation/controllers/user.controller';
import { AuthController } from './presentation/controllers/auth.controller';

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
  JwtStrategy,
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
];

const ApplicationHandlers = [
  ScanQrAttendanceHandler,
  RegisterManualAttendanceHandler,
  CheckOutAttendanceHandler,
  RegisterManualCheckOutHandler,
  ConfirmAbsenceHandler,
  CreateChildHandler,
  GetAllChildrenHandler,
  StartTripHandler,
  GetTripStopsHandler,
  GetAllTripsHandler,
  GetAllRouteTemplatesHandler,
  CreateRouteTemplateHandler,
  CreateTripHandler,
  GenerateDailyTripsHandler,
  CreateUserHandler,
  GetAllUsersHandler,
  LoginHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'super_secret_fallback_key',
        signOptions: { expiresIn: '1d' }, // Expiración de 1 día
      }),
    }),
  ],
  controllers: [RouteController, AttendanceController, ChildController, UserController, AuthController],
  providers: [
    ...InfrastructureProviders,
    ...ApplicationHandlers,
  ],
})
export class TransportationModule { }
