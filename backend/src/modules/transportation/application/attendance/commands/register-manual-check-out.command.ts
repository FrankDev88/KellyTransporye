export class RegisterManualCheckOutCommand {
  constructor(
    public readonly childId: string,
    public readonly driverId: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly reason: 'Extravío' | 'Daño' | 'Olvido',
  ) {}
}
