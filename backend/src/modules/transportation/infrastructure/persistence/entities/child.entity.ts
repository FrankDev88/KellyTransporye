import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmUserEntity } from './user.entity';

@Entity('children')
export class TypeOrmChildEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'first_name', type: 'text' })
  firstName: string;

  @Column({ name: 'last_name', type: 'text' })
  lastName: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string;

  @Column({ name: 'qr_identifier', type: 'uuid', unique: true })
  qrIdentifier: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => TypeOrmUserEntity)
  @JoinColumn({ name: 'parent_id' })
  parent: TypeOrmUserEntity;

  @Column({ name: 'home_address', type: 'text' })
  homeAddress: string;

  // pg driver returns objects for point { x, y }
  @Column({ name: 'home_lat_long', type: 'point' })
  homeLatLong: string | { x: number; y: number };

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
