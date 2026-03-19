export class CreateRouteTemplateCommand {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly estimatedDuration: string,
    public readonly childrenIds: string[],
  ) {}
}
