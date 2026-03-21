import { ICommand } from '@nestjs/cqrs';
import { GpsPoint } from '../../../domain/entities/child.entity';

export class CreateChildCommand implements ICommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly parentId: string,
    public readonly qrIdentifier: string,
    public readonly homeAddress: string,
    public readonly homeLocation: GpsPoint,
    public readonly photoUrl?: string,
  ) {}
}
