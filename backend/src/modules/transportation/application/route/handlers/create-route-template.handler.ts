import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { RouteTemplate, RouteTemplateStop, RouteType } from '../../../domain/entities/route-template.entity';
import { CreateRouteTemplateCommand } from '../commands/create-route-template.command';

@CommandHandler(CreateRouteTemplateCommand)
export class CreateRouteTemplateHandler implements ICommandHandler<CreateRouteTemplateCommand, Result<string>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: CreateRouteTemplateCommand): Promise<Result<string>> {
    const { name, type, estimatedDuration, childrenIds } = command;

    try {
      await this.uow.startTransaction();

      // 1. Crear las paradas (RouteTemplateStops) basándose en los niños asignados
      const templateId = crypto.randomUUID();
      const stops = childrenIds.map((childId, index) => {
        return new RouteTemplateStop({
          id: crypto.randomUUID(),
          templateId: templateId,
          childId: childId,
          stopOrder: index + 1,
        });
      });

      // 2. Instanciar el nuevo Template
      const newTemplate = new RouteTemplate({
        id: templateId,
        name: name,
        type: type as RouteType,
        estimatedDuration: estimatedDuration,
        createdAt: new Date(),
        stops: stops
      });

      // 3. Guardar el template principal
      await this.uow.routeTemplateRepository.save(newTemplate);

      console.log(`[CreateRouteTemplateHandler] Plantilla ${newTemplate.name} (${newTemplate.id}) creada con ${stops.length} paradas.`);

      await this.uow.complete();
      return Result.ok<string>(newTemplate.id);

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Error al crear la nueva plantilla de ruta.');
    }
  }
}
