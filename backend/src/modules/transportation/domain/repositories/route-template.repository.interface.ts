import { RouteTemplate } from '../entities/route-template.entity';

export interface RouteTemplateRepository {
  findById(id: string): Promise<RouteTemplate | null>;
  findAll(): Promise<RouteTemplate[]>;
  save(template: RouteTemplate): Promise<void>;
}

export const ROUTE_TEMPLATE_REPOSITORY = 'ROUTE_TEMPLATE_REPOSITORY';
