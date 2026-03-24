export const RouteType = {
    HOME_TO_SCHOOL: 'HOME_TO_SCHOOL',
    SCHOOL_TO_HOME: 'SCHOOL_TO_HOME',
} as const;
export type RouteType = typeof RouteType[keyof typeof RouteType];

export interface RouteTemplateStopProps {
    id: string;
    templateId: string;
    childId: string;
    stopOrder: number;
}

export interface RouteTemplateProps {
    id: string;
    name: string;
    type: RouteType;
    estimatedDuration?: string;
    createdAt: Date;
    stops: RouteTemplateStopProps[];
}

export class RouteTemplate {
    public readonly props: RouteTemplateProps;
    constructor(props: RouteTemplateProps) {
        this.props = props;
    }
}
