export class CheckOutAttendanceCommand {
  constructor(
    public readonly childId: string,
    public readonly driverId: string,
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}
}
