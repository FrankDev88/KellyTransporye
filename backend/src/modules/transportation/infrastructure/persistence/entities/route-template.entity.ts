import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { RouteType } from '../../../domain/entities/route-template.entity';
import { TypeOrmRouteTemplateStopEntity } from './route-template-stop.entity';

@Entity('route_templates')
export class TypeOrmRouteTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'enum', enum: RouteType })
  type: RouteType;

  @Column({ name: 'estimated_duration', type: 'interval', nullable: true })
  estimatedDuration: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => TypeOrmRouteTemplateStopEntity, stop => stop.template, { cascade: true })
  stops: TypeOrmRouteTemplateStopEntity[];
}
