export class ScanQrAttendanceCommand {
  constructor(
    public readonly qrIdentifier: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly driverId: string,
  ) {}
}
