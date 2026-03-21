import { ICommand } from '@nestjs/cqrs';
import { LoginDto } from '../../../presentation/dtos/auth.dto';

export class LoginCommand implements ICommand {
  constructor(public readonly dto: LoginDto) {}
}
