import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UNIT_OF_WORK, UnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Result } from '../../../domain/result';
import { GenerateDailyTripsCommand } from '../commands/generate-daily-trips.command';
import { Trip } from '../../../domain/entities/trip.entity';

@CommandHandler(GenerateDailyTripsCommand)
export class GenerateDailyTripsHandler implements ICommandHandler<GenerateDailyTripsCommand, Result<number>> {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  async execute(command: GenerateDailyTripsCommand): Promise<Result<number>> {
    const { targetDate } = command;

    try {
      await this.uow.startTransaction();

      const templates = await this.uow.routeTemplateRepository.findAll();
      let generatedCount = 0;

      for (const template of templates) {
        // En una implementación real más compleja, se podría validar si ya existe 
        // un viaje para esa plantilla en ese mismo día para no duplicar.
        
        // Asignamos un driver genérico o requerimos que se asigne luego.
        // Para este caso usaremos un ID nulo o un UUID temporal (idealmente debería venir en el template
        // o asignarse en la interfaz posteriormente, pero el modelo requiere un UUID en base de datos.
        // Simularemos que el driver se asignará, y pondremos un UUID de sistema o se deja pendiente 
        // según el diseño de la tabla (si driverId acepta nulos).
        // En el esquema actual, el driverId no acepta nulls, por ende, este handler masivo 
        // puede necesitar recibir mapeos o utilizar un conductor por defecto, 
        // o mejor aún, si DriverId es un UUID válido.
        
        const dummyDriverId = randomUUID(); // Reemplazar con lógica de asignación real si existe

        const trip = new Trip({
          id: randomUUID(),
          templateId: template.id,
          driverId: dummyDriverId, // Debería ser asignable luego
          scheduledStart: targetDate,
          isActive: false,
          exceptions: [],
        });

        await this.uow.tripRepository.save(trip);
        generatedCount++;
      }

      await this.uow.complete();
      return Result.ok<number>(generatedCount);

    } catch (error) {
      console.error(error);
      await this.uow.rollback();
      return Result.fail('Ocurrió un error inesperado al generar los viajes masivos.');
    }
  }
}
