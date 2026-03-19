import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { TripRepository } from '../../../domain/repositories/trip.repository.interface';
import { Trip } from '../../../domain/entities/trip.entity';
import { TripMapper } from '../mappers/trip.mapper';
import { TypeOrmTripEntity } from '../entities/trip.entity';

@Injectable()
export class PostgresTripRepository implements TripRepository {
  constructor(private readonly dataSource: DataSource, private readonly txManager?: EntityManager) {}

  private get manager(): EntityManager {
    return this.txManager || this.dataSource.manager;
  }

  async findById(id: string): Promise<Trip | null> {
    const raw = await this.manager.findOne(TypeOrmTripEntity, {
      where: { id },
      relations: ['exceptions'],
    });
    return raw ? TripMapper.toDomain(raw) : null;
  }

  async findActiveByDriver(driverId: string): Promise<Trip | null> {
    const raw = await this.manager.findOne(TypeOrmTripEntity, {
      where: { driverId, isActive: true },
      relations: ['exceptions'],
    });
    return raw ? TripMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Trip[]> {
    const rawList = await this.manager.find(TypeOrmTripEntity, {
      relations: ['exceptions'],
    });
    return rawList.map(raw => TripMapper.toDomain(raw));
  }

  async save(trip: Trip): Promise<void> {
    const persistenceData = TripMapper.toPersistence(trip);
    await this.manager.save(TypeOrmTripEntity, persistenceData);
  }

  async delete(id: string): Promise<void> {
    await this.manager.delete(TypeOrmTripEntity, id);
  }
}
