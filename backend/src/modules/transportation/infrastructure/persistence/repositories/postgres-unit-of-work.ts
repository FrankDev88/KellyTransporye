import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';

// Repositories Implementations
import { PostgresChildRepository } from './postgres-child.repository';
import { PostgresRouteTemplateRepository } from './postgres-route-template.repository';
import { PostgresTripRepository } from './postgres-trip.repository';
import { PostgresUserRepository } from './postgres-user.repository';
import { PostgresAttendanceLogRepository } from './postgres-attendance-log.repository';

// Repositories Interfaces
import { ChildRepository } from '../../../domain/repositories/child.repository.interface';
import { RouteTemplateRepository } from '../../../domain/repositories/route-template.repository.interface';
import { TripRepository } from '../../../domain/repositories/trip.repository.interface';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { AttendanceLogRepository } from '../../../domain/repositories/attendance-log.repository.interface';

@Injectable()
export class PostgresUnitOfWork implements UnitOfWork {
  private queryRunner: QueryRunner;

  // Repositorios expuestos en la interfaz
  public childRepository: ChildRepository;
  public routeTemplateRepository: RouteTemplateRepository;
  public tripRepository: TripRepository;
  public userRepository: UserRepository;
  public attendanceLogRepository: AttendanceLogRepository;

  constructor(private readonly dataSource: DataSource) {
    this.resetRepositories();
  }

  async startTransaction(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    // Actualizamos las instancias para usar el manager transaccional
    this.childRepository = new PostgresChildRepository(this.dataSource, this.queryRunner.manager);
    this.routeTemplateRepository = new PostgresRouteTemplateRepository(this.dataSource, this.queryRunner.manager);
    this.tripRepository = new PostgresTripRepository(this.dataSource, this.queryRunner.manager);
    this.userRepository = new PostgresUserRepository(this.dataSource, this.queryRunner.manager);
    this.attendanceLogRepository = new PostgresAttendanceLogRepository(this.dataSource, this.queryRunner.manager);
  }

  async complete(): Promise<void> {
    if (this.queryRunner) {
      await this.queryRunner.commitTransaction();
      await this.queryRunner.release();
      this.queryRunner = null;
    }
    this.resetRepositories();
  }

  async rollback(): Promise<void> {
    if (this.queryRunner) {
      await this.queryRunner.rollbackTransaction();
      await this.queryRunner.release();
      this.queryRunner = null;
    }
    this.resetRepositories();
  }

  private resetRepositories(): void {
    this.childRepository = new PostgresChildRepository(this.dataSource);
    this.routeTemplateRepository = new PostgresRouteTemplateRepository(this.dataSource);
    this.tripRepository = new PostgresTripRepository(this.dataSource);
    this.userRepository = new PostgresUserRepository(this.dataSource);
    this.attendanceLogRepository = new PostgresAttendanceLogRepository(this.dataSource);
  }
}
