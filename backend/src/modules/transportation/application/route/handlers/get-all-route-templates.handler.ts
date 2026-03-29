import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { GetAllRouteTemplatesQuery } from '../queries/get-all-route-templates.query';
import { Result } from '../../../domain/result';
import { RouteTemplate } from '../../../domain/entities/route-template.entity';

@QueryHandler(GetAllRouteTemplatesQuery)
export class GetAllRouteTemplatesHandler implements IQueryHandler<GetAllRouteTemplatesQuery, Result<RouteTemplate[]>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(query: GetAllRouteTemplatesQuery): Promise<Result<RouteTemplate[]>> {
    try {
      const templates = await this.uow.routeTemplateRepository.findAll();
      return Result.ok(templates);
    } catch (error) {
      console.error(error);
      return Result.fail('Error al obtener la lista de plantillas de ruta.');
    }
  }
}
