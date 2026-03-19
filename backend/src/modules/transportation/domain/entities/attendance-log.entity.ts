import { GpsPoint } from './child.entity';

export enum AttendanceMethod {
  QR_SCAN = 'QR_SCAN',
  MANUAL_BY_DRIVER = 'MANUAL_BY_DRIVER',
  ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
}

export interface AttendanceLogProps {
  id: string;
  childId: string;
  tripId: string;
  driverId: string;
  method: AttendanceMethod;
  location: GpsPoint;
  reason?: string; // Obligatorio para manual (Extravío, Daño, Olvido)
  timestamp: Date;
}

export class AttendanceLog {
  constructor(private readonly props: AttendanceLogProps) {}

  get id(): string { return this.props.id; }
  get childId(): string { return this.props.childId; }
  get tripId(): string { return this.props.tripId; }
  get method(): AttendanceMethod { return this.props.method; }
  get reason(): string | undefined { return this.props.reason; }
}
