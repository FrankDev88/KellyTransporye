/**
 * Commando administrativo para confirmar la inasistencia de un niño.
 */
export class ConfirmAbsenceCommand {
  constructor(
    public readonly childId: string,
    public readonly reason: string,
    public readonly tripId: string,
  ) {}
}
