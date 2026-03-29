export class CreateRouteTemplateCommand {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly estimatedDuration: string | undefined,
    public readonly childrenIds: string[],
    public readonly defaultDriverId?: string,
  ) {}
}
