export enum ChildStatus {
  PENDING = 'PENDING',
  ON_BOARD = 'ON_BOARD',
  COMPLETED = 'COMPLETED',
  ABSENCE_CONFIRMED = 'ABSENCE_CONFIRMED',
  MISSING_ALERT = 'MISSING_ALERT',
}

export interface GpsPoint {
  latitude: number;
  longitude: number;
}

export interface ChildProps {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  qrIdentifier: string;
  parentId: string;
  homeAddress: string;
  homeLocation: GpsPoint;
  status: ChildStatus;
  isActive: boolean;
}

export class Child {
  constructor(private props: ChildProps) {}

  // Getters para acceder a las propiedades
  get id(): string { return this.props.id; }
  get fullName(): string { return `${this.props.firstName} ${this.props.lastName}`; }
  get status(): ChildStatus { return this.props.status; }
  get qrIdentifier(): string { return this.props.qrIdentifier; }
  get homeLocation(): GpsPoint { return this.props.homeLocation; }
  get photoUrl(): string | undefined { return this.props.photoUrl; }

  // --- Reglas de Negocio (Domain Logic) ---

  /**
   * Cambia el estado a ON_BOARD tras un escaneo de QR o Check-in manual.
   * Invariante: Solo se puede abordar si está PENDING o en alerta.
   */
  checkIn(): void {
    if (this.props.status === ChildStatus.ABSENCE_CONFIRMED) {
      throw new Error('No se puede abordar a un niño con inasistencia confirmada.');
    }
    
    if (this.props.status === ChildStatus.ON_BOARD) {
      throw new Error('El niño ya se encuentra a bordo.');
    }

    this.props.status = ChildStatus.ON_BOARD;
  }

  /**
   * Cambia el estado a COMPLETED al entregar al niño.
   * Invariante: No se puede entregar si no ha abordado previamente.
   */
  checkOut(): void {
    if (this.props.status !== ChildStatus.ON_BOARD) {
      throw new Error('No se puede realizar Check-Out sin un Check-In previo.');
    }

    this.props.status = ChildStatus.COMPLETED;
  }

  /**
   * Marca al niño como inasistencia tras confirmación administrativa.
   */
  confirmAbsence(): void {
    if (this.props.status === ChildStatus.ON_BOARD) {
      throw new Error('No se puede marcar inasistencia si el niño ya abordó.');
    }
    this.props.status = ChildStatus.ABSENCE_CONFIRMED;
  }

  /**
   * Verifica si el niño está dentro del radio de geocerca (50m por defecto).
   * @param currentBusLocation Ubicación actual del bus.
   * @returns boolean
   */
  isWithinGeofence(currentBusLocation: GpsPoint): boolean {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (this.props.homeLocation.latitude * Math.PI) / 180;
    const φ2 = (currentBusLocation.latitude * Math.PI) / 180;
    const Δφ = ((currentBusLocation.latitude - this.props.homeLocation.latitude) * Math.PI) / 180;
    const Δλ = ((currentBusLocation.longitude - this.props.homeLocation.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distancia en metros
    return distance <= 50; // Umbral de 50m según GEMINI.md
  }
}
