export enum RouteType {
  HOME_TO_SCHOOL = 'HOME_TO_SCHOOL',
  SCHOOL_TO_HOME = 'SCHOOL_TO_HOME',
}

export interface RouteTemplateStopProps {
  id: string;
  templateId: string;
  childId: string;
  stopOrder: number;
}

export class RouteTemplateStop {
  constructor(private props: RouteTemplateStopProps) {}

  get id(): string { return this.props.id; }
  get templateId(): string { return this.props.templateId; }
  get childId(): string { return this.props.childId; }
  get stopOrder(): number { return this.props.stopOrder; }
}

export interface RouteTemplateProps {
  id: string;
  name: string;
  type: RouteType;
  estimatedDuration?: string; // e.g. interval representation or just string for now
  createdAt: Date;
  stops: RouteTemplateStop[];
}

/**
 * Representa la Plantilla Maestra de una ruta (El deber ser).
 */
export class RouteTemplate {
  constructor(private props: RouteTemplateProps) {}

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get type(): RouteType { return this.props.type; }
  get stops(): RouteTemplateStop[] { return [...this.props.stops].sort((a, b) => a.stopOrder - b.stopOrder); }
}
