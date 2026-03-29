import { RouteTemplate, RouteTemplateStop, RouteType } from '../../../domain/entities/route-template.entity';
import { TypeOrmRouteTemplateEntity } from '../entities/route-template.entity';
import { TypeOrmRouteTemplateStopEntity } from '../entities/route-template-stop.entity';

export class RouteTemplateMapper {
  static toDomain(raw: TypeOrmRouteTemplateEntity): RouteTemplate {
    const stops = (raw.stops || []).map(stopRaw => new RouteTemplateStop({
      id: stopRaw.id,
      templateId: stopRaw.templateId,
      childId: stopRaw.childId,
      stopOrder: stopRaw.stopOrder,
    }));

    return new RouteTemplate({
      id: raw.id,
      name: raw.name,
      type: raw.type as RouteType,
      defaultDriverId: raw.defaultDriverId ?? undefined,
      estimatedDuration: raw.estimatedDuration,
      createdAt: raw.createdAt,
      stops: stops,
    });
  }

  static toPersistence(template: RouteTemplate): Partial<TypeOrmRouteTemplateEntity> {
    const stops: Partial<TypeOrmRouteTemplateStopEntity>[] = template.stops.map(stop => ({
      id: stop.id,
      templateId: stop.templateId,
      childId: stop.childId,
      stopOrder: stop.stopOrder,
    }));

    return {
      id: template.id,
      name: template.name,
      type: template.type,
      defaultDriverId: template.defaultDriverId || null,
      stops: stops as any,
    };
  }
}
