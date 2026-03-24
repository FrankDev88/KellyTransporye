export interface TripProps {
    id: string;
    templateId: string;
    driverId: string;
    scheduledStart: string;
    actualStart?: string;
    actualEnd?: string;
    isActive: boolean;
}

export class Trip {
    public readonly props: TripProps;
    constructor(props: TripProps) {
        this.props = props;
    }
}
