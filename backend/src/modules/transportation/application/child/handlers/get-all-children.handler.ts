import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllChildrenQuery } from '../queries/get-all-children.query';
import { ChildRepository, CHILD_REPOSITORY } from '../../../domain/repositories/child.repository.interface';
import { Child } from '../../../domain/entities/child.entity';
import { Result } from '../../../domain/result';

@QueryHandler(GetAllChildrenQuery)
export class GetAllChildrenHandler implements IQueryHandler<GetAllChildrenQuery> {
    constructor(
        @Inject(CHILD_REPOSITORY)
        private readonly childRepository: ChildRepository,
    ) { }

    async execute(_query: GetAllChildrenQuery): Promise<Result<Child[]>> {
        try {
            const children = await this.childRepository.findAll();
            return Result.ok(children);
        } catch (error: any) {
            return Result.fail(error.message || 'Error al obtener la lista de niños.');
        }
    }
}
