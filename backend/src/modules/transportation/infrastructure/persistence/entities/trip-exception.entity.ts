import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TypeOrmTripEntity } from './trip.entity';
import { TypeOrmChildEntity } from './child.entity';
import { ChildStatus } from '../../../domain/entities/child.entity';

@Entity('trip_exceptions')
export class TypeOrmTripExceptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'trip_id', type: 'uuid' })
  tripId: string;

  @ManyToOne(() => TypeOrmTripEntity, trip => trip.exceptions)
  @JoinColumn({ name: 'trip_id' })
  trip: TypeOrmTripEntity;

  @Column({ name: 'child_id', type: 'uuid' })
  childId: string;

  @ManyToOne(() => TypeOrmChildEntity)
  @JoinColumn({ name: 'child_id' })
  child: TypeOrmChildEntity;

  @Column({ name: 'exception_type', type: 'varchar', default: 'ABSENCE_CONFIRMED' })
  exceptionType: ChildStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
