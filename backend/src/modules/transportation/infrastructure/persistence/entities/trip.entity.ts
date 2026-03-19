import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TypeOrmRouteTemplateEntity } from './route-template.entity';
import { TypeOrmUserEntity } from './user.entity';
import { TypeOrmTripExceptionEntity } from './trip-exception.entity';

@Entity('trips')
export class TypeOrmTripEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @ManyToOne(() => TypeOrmRouteTemplateEntity)
  @JoinColumn({ name: 'template_id' })
  template: TypeOrmRouteTemplateEntity;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string;

  @ManyToOne(() => TypeOrmUserEntity)
  @JoinColumn({ name: 'driver_id' })
  driver: TypeOrmUserEntity;

  @Column({ name: 'scheduled_start', type: 'timestamptz' })
  scheduledStart: Date;

  @Column({ name: 'actual_start', type: 'timestamptz', nullable: true })
  actualStart: Date;

  @Column({ name: 'actual_end', type: 'timestamptz', nullable: true })
  actualEnd: Date;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(() => TypeOrmTripExceptionEntity, exception => exception.trip, { cascade: true })
  exceptions: TypeOrmTripExceptionEntity[];
}
