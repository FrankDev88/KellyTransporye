import { Result } from '../../domain/models/Result';
import type { Trip } from '../../domain/models/Trip';
import type { TripStop, RouteRepository } from '../../domain/repositories/route.repository';
import type {
    CreateRouteTemplateData,
    CreateTripData,
    StartTripData,
    GenerateDailyTripsData,
    CheckInData,
    CheckOutData,
    ManualCheckInData,
} from '../../domain/schemas/routeSchema';
import { api } from '../api/axios';

export class AxiosRouteRepository implements RouteRepository {
    async getTemplates(): Promise<Result<any[]>> {
        try {
            const response = await api.get<{ data: any[] }>('/transportation/route/templates');
            return Result.ok(response.data.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al obtener las plantillas');
        }
    }

    async getTrips(): Promise<Result<Trip[]>> {
        try {
            const response = await api.get<{ data: Trip[] }>('/transportation/route/trips');
            return Result.ok(response.data.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al obtener los viajes');
        }
    }

    async getTripStops(tripId: string): Promise<Result<TripStop[]>> {
        try {
            const response = await api.get<{ data: TripStop[] }>(`/transportation/route/trip/${tripId}/stops`);
            return Result.ok(response.data.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al obtener las paradas');
        }
    }

    async createTemplate(data: CreateRouteTemplateData): Promise<Result<{ templateId: string; message: string }>> {
        try {
            const response = await api.post<{ templateId: string; message: string }>('/transportation/route/template/create', data);
            return Result.ok(response.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al crear la plantilla');
        }
    }

    async createTrip(data: CreateTripData): Promise<Result<{ tripId: string; message: string }>> {
        try {
            const response = await api.post<{ tripId: string; message: string }>('/transportation/route/trip/create', data);
            return Result.ok(response.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al crear el viaje');
        }
    }

    async startTrip(data: StartTripData): Promise<Result<{ message: string }>> {
        try {
            const response = await api.post<{ message: string }>('/transportation/route/trip/start', data);
            return Result.ok(response.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al iniciar el viaje');
        }
    }

    async generateDailyTrips(data: GenerateDailyTripsData): Promise<Result<{ message: string }>> {
        try {
            const response = await api.post<{ message: string }>('/transportation/route/trip/generate-daily', data);
            return Result.ok(response.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al generar viajes diarios');
        }
    }

    async checkIn(data: CheckInData): Promise<Result<{ message: string }>> {
        try {
            const response = await api.post<{ message: string }>('/transportation/attendance/scan', data);
            return Result.ok(response.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al registrar el abordaje');
        }
    }

    async checkOut(data: CheckOutData): Promise<Result<{ message: string }>> {
        try {
            const response = await api.post<{ message: string }>('/transportation/attendance/checkout', data);
            return Result.ok(response.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al registrar la entrega');
        }
    }

    async manualCheckIn(data: ManualCheckInData): Promise<Result<{ message: string }>> {
        try {
            const response = await api.post<{ message: string }>('/transportation/attendance/manual', data);
            return Result.ok(response.data);
        } catch (error: any) {
            return Result.fail(error.response?.data?.message || 'Error al registrar abordaje manual');
        }
    }
}
