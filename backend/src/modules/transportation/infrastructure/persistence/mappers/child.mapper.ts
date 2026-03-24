import { Child, ChildStatus, GpsPoint } from '../../../domain/entities/child.entity';
import { TypeOrmChildEntity } from '../entities/child.entity';

export class ChildMapper {
  static toDomain(raw: TypeOrmChildEntity): Child {
    return new Child({
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      photoUrl: raw.photoUrl,
      qrIdentifier: raw.qrIdentifier,
      parentId: raw.parentId,
      homeAddress: raw.homeAddress,
      homeLocation: this.mapPointToGpsPoint(raw.homeLatLong),
      // status is not stored in the children table; default to PENDING
      status: ChildStatus.PENDING,
      isActive: raw.isActive,
    });
  }

  static toPersistence(child: Child): Partial<TypeOrmChildEntity> {
    return {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      photoUrl: child.photoUrl,
      qrIdentifier: child.qrIdentifier,
      parentId: child.parentId,
      homeAddress: child.homeAddress,
      homeLatLong: `(${child.homeLocation.latitude},${child.homeLocation.longitude})`,
      isActive: child.isActive,
    };
  }

  private static mapPointToGpsPoint(point: any): GpsPoint {
    if (typeof point === 'string') {
      const parts = point.replace(/[()]/g, '').split(',');
      return { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
    }
    return { latitude: point.x || 0, longitude: point.y || 0 };
  }
}
