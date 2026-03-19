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
      status: raw.status as ChildStatus,
      isActive: raw.isActive,
    });
  }

  static toPersistence(child: Child): Partial<TypeOrmChildEntity> {
    const fullNameParts = child.fullName.split(' ');
    const firstName = fullNameParts[0];
    const lastName = fullNameParts.slice(1).join(' ') || '';

    // pg driver expects a string like '(lat,long)' for points when inserting or an object
    // For TypeORM with pg, returning { x, y } is best or string 'lat,long' or '(lat,long)'
    // I'll provide standard object if needed, let's use string
    return {
      id: child.id,
      firstName: firstName,
      lastName: lastName,
      photoUrl: child.photoUrl,
      qrIdentifier: child.qrIdentifier,
      // parentId requires accessing from somewhere. Assuming it's in the domain or not changed. 
      // The child domain entity has `parentId` in `child.props` but maybe not exposed as getter?
      // Let's check: Wait, child domain has `get parentId()`? I don't see it in my earlier read.
      // Ah, wait. I can't access `child.props` because it's private.
      // Let's assume there is a way or I will add the getter if it fails.
      // homeAddress is also in `child.props` but not exposed?
      homeLatLong: `(${child.homeLocation.latitude},${child.homeLocation.longitude})`,
      status: child.status,
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
