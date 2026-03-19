export class StartTripCommand {
  constructor(
    public readonly tripId: string,
    public readonly driverId: string,
  ) {}
}
