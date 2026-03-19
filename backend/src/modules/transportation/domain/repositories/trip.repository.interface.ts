import { Trip } from '../entities/trip.entity';

export interface TripRepository {
  findById(id: string): Promise<Trip | null>;
  findActiveByDriver(driverId: string): Promise<Trip | null>;
  findAll(): Promise<Trip[]>;
  save(trip: Trip): Promise<void>;
  delete(id: string): Promise<void>;
}

export const TRIP_REPOSITORY = 'TRIP_REPOSITORY';
