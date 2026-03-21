import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from '../queries/get-all-users.query';
import { Inject } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { Result } from '../../../domain/result';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetAllUsersQuery): Promise<Result<User[]>> {
    try {
      const users = await this.userRepository.findAll();
      return Result.ok(users);
    } catch (error) {
      return Result.fail('Error al recuperar los usuarios.');
    }
  }
}
