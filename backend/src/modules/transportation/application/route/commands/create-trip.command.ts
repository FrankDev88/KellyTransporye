export class CreateTripCommand {
  constructor(
    public readonly templateId: string,
    public readonly driverId: string,
    public readonly scheduledStart?: Date,
  ) {}
}
