import { ICommand } from '@nestjs/cqrs';
import { CreateUserProps } from '../../../domain/entities/user.entity';

export class CreateUserCommand implements ICommand {
  constructor(public readonly props: CreateUserProps) {}
}
