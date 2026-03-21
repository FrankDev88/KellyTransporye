import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateChildCommand } from '../commands/create-child.command';
import { ChildRepository, CHILD_REPOSITORY } from '../../../domain/repositories/child.repository.interface';
import { Child } from '../../../domain/entities/child.entity';
import { Result } from '../../../domain/result';

@CommandHandler(CreateChildCommand)
export class CreateChildHandler implements ICommandHandler<CreateChildCommand, Result<string>> {
  constructor(
    @Inject(CHILD_REPOSITORY)
    private readonly childRepository: ChildRepository,
  ) {}

  async execute(command: CreateChildCommand): Promise<Result<string>> {
    try {
      // 1. Verificar si ya existe un niño con el mismo QR
      const existingChild = await this.childRepository.findByQr(command.qrIdentifier);
      if (existingChild) {
        return Result.fail('El identificador de QR ya está asignado a otro niño.');
      }

      // 2. Crear la entidad de dominio
      const child = Child.create({
        firstName: command.firstName,
        lastName: command.lastName,
        parentId: command.parentId,
        qrIdentifier: command.qrIdentifier,
        homeAddress: command.homeAddress,
        homeLocation: command.homeLocation,
        photoUrl: command.photoUrl,
      });

      // 3. Guardar en infraestructura
      await this.childRepository.save(child);

      return Result.ok(child.id);
    } catch (error: any) {
      return Result.fail(error.message || 'Error inesperado al crear el registro del niño.');
    }
  }
}
