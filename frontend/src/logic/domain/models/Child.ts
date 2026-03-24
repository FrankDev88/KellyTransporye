export const ChildStatus = {
    PENDING: 'PENDING',
    ON_BOARD: 'ON_BOARD',
    COMPLETED: 'COMPLETED',
    ABSENCE_CONFIRMED: 'ABSENCE_CONFIRMED',
    MISSING_ALERT: 'MISSING_ALERT',
} as const;

export type ChildStatus = typeof ChildStatus[keyof typeof ChildStatus];

export interface GpsPoint {
    latitude: number;
    longitude: number;
}

export interface ChildProps {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    qrIdentifier: string;
    parentId: string;
    homeAddress: string;
    homeLocation: GpsPoint;
    status: ChildStatus;
    isActive: boolean;
}

export class Child {
    public readonly props: ChildProps;
    constructor(props: ChildProps) {
        this.props = props;
    }
}
