import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { AttendanceMethod } from '../../../domain/entities/attendance-log.entity';
import { ChildStatus as AttendanceStatus } from '../../../domain/entities/child.entity'; // from bd.sql it uses PENDING, ON_BOARD...
import { TypeOrmChildEntity } from './child.entity';
import { TypeOrmTripEntity } from './trip.entity';
import { TypeOrmUserEntity } from './user.entity';

@Entity('attendance_logs')
export class TypeOrmAttendanceLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'child_id', type: 'uuid', nullable: true })
  childId: string;

  @ManyToOne(() => TypeOrmChildEntity)
  @JoinColumn({ name: 'child_id' })
  child: TypeOrmChildEntity;

  @Column({ name: 'trip_id', type: 'uuid', nullable: true })
  tripId: string;

  @ManyToOne(() => TypeOrmTripEntity)
  @JoinColumn({ name: 'trip_id' })
  trip: TypeOrmTripEntity;

  @Column({ type: 'varchar' }) // enum type mapping requires more setup in typeorm if manually syncing, varchar is safer if bd.sql manages enums
  status: string;

  @Column({ type: 'varchar' })
  method: string;

  @CreateDateColumn({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @Column({ name: 'gps_location', type: 'point' })
  gpsLocation: string | { x: number; y: number };

  @Column({ name: 'authorized_by', type: 'uuid', nullable: true })
  authorizedBy: string;

  @ManyToOne(() => TypeOrmUserEntity)
  @JoinColumn({ name: 'authorized_by' })
  authorizer: TypeOrmUserEntity;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
