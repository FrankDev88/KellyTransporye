import { Child, ChildStatus } from '../entities/child.entity';

export interface ChildRepository {
  findById(id: string): Promise<Child | null>;
  findByQr(qrIdentifier: string): Promise<Child | null>;
  save(child: Child): Promise<void>;
  findAll(): Promise<Child[]>;

  /**
   * Obtiene la lista de niños filtrados por su estado actual.
   * Útil para conductores que ven la lista de "PENDING" para Check-in manual.
   */
  findByStatus(status: ChildStatus): Promise<Child[]>;

  /**
   * Obtiene todos los niños asociados a un padre.
   */
  findByParent(parentId: string): Promise<Child[]>;
}

// Token para la inyección de dependencias en NestJS
export const CHILD_REPOSITORY = 'CHILD_REPOSITORY';
