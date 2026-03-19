import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmRouteTemplateEntity } from './route-template.entity';
import { TypeOrmChildEntity } from './child.entity';

@Entity('route_template_stops')
export class TypeOrmRouteTemplateStopEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ManyToOne(() => TypeOrmRouteTemplateEntity, template => template.stops)
  @JoinColumn({ name: 'template_id' })
  template: TypeOrmRouteTemplateEntity;

  @Column({ name: 'child_id', type: 'uuid' })
  childId: string;

  @ManyToOne(() => TypeOrmChildEntity)
  @JoinColumn({ name: 'child_id' })
  child: TypeOrmChildEntity;

  @Column({ name: 'stop_order', type: 'int' })
  stopOrder: number;
}
