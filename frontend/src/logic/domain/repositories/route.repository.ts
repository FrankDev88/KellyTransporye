import type { Trip } from '../models/Trip';
import type { CreateRouteTemplateData, CreateTripData, StartTripData, GenerateDailyTripsData, CheckInData, CheckOutData, ManualCheckInData } from '../schemas/routeSchema';
import type { Result } from '../models/Result';

export interface TripStop {
    id: string;
    childId: string;
    childFirstName: string;
    childLastName: string;
    childPhotoUrl?: string;
    homeAddress: string;
    latitude: number;
    longitude: number;
    stopOrder: number;
    status: 'PENDING' | 'ON_BOARD' | 'COMPLETED' | 'ABSENCE_CONFIRMED' | 'MISSING_ALERT';
}

export interface RouteRepository {
    getTrips(): Promise<Result<Trip[]>>;
    getTripStops(tripId: string): Promise<Result<TripStop[]>>;
    createTemplate(data: CreateRouteTemplateData): Promise<Result<{ templateId: string; message: string }>>;
    createTrip(data: CreateTripData): Promise<Result<{ tripId: string; message: string }>>;
    startTrip(data: StartTripData): Promise<Result<{ message: string }>>;
    generateDailyTrips(data: GenerateDailyTripsData): Promise<Result<{ message: string }>>;
    checkIn(data: CheckInData): Promise<Result<{ message: string }>>;
    checkOut(data: CheckOutData): Promise<Result<{ message: string }>>;
    manualCheckIn(data: ManualCheckInData): Promise<Result<{ message: string }>>;
}
