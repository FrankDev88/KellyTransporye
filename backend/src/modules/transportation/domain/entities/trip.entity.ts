import { ChildStatus } from './child.entity';

export interface TripExceptionProps {
  id: string;
  tripId: string;
  childId: string;
  exceptionType: ChildStatus;
  reason?: string;
  createdAt: Date;
}

/**
 * Representa una excepción (ej. Niño ausente) durante un viaje específico.
 * Reemplaza a las paradas dinámicas saltadas.
 */
export class TripException {
  constructor(private props: TripExceptionProps) {}

  get id(): string { return this.props.id; }
  get tripId(): string { return this.props.tripId; }
  get childId(): string { return this.props.childId; }
  get exceptionType(): ChildStatus { return this.props.exceptionType; }
  get reason(): string | undefined { return this.props.reason; }
}

export interface TripProps {
  id: string;
  templateId: string;
  driverId: string;
  scheduledStart: Date;
  actualStart?: Date;
  actualEnd?: Date;
  isActive: boolean;
  exceptions: TripException[];
}

/**
 * Representa la Ejecución Diaria de un viaje.
 */
export class Trip {
  constructor(private props: TripProps) {}

  get id(): string { return this.props.id; }
  get templateId(): string { return this.props.templateId; }
  get driverId(): string { return this.props.driverId; }
  get scheduledStart(): Date { return this.props.scheduledStart; }
  get actualStart(): Date | undefined { return this.props.actualStart; }
  get actualEnd(): Date | undefined { return this.props.actualEnd; }
  get isActive(): boolean { return this.props.isActive; }
  get exceptions(): TripException[] { return [...this.props.exceptions]; }

  /**
   * Inicia oficialmente el viaje.
   */
  start(): void {
    if (this.props.isActive) {
      throw new Error('El viaje ya está activo.');
    }
    this.props.actualStart = new Date();
    this.props.isActive = true;
  }

  /**
   * Finaliza el viaje.
   */
  end(): void {
    if (!this.props.isActive) {
      throw new Error('El viaje no está activo o ya ha finalizado.');
    }
    this.props.actualEnd = new Date();
    this.props.isActive = false;
  }

  /**
   * Agrega una excepción (ej: Niño enfermo) al viaje actual.
   */
  addException(exception: TripException): void {
    // Verificar que no exista ya una excepción para este niño en este viaje
    const exists = this.props.exceptions.find(e => e.childId === exception.childId);
    if (exists) {
      throw new Error('El niño ya cuenta con una excepción registrada para este viaje.');
    }
    this.props.exceptions.push(exception);
  }
}
