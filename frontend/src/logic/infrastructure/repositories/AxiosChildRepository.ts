import { Result } from "../../domain/models/Result";
import type { Child } from "../../domain/models/Child";
import type { ChildRepository } from "../../domain/repositories/child.repository";
import type { CreateChildCredentials } from "../../domain/schemas/childSchema";
import { api } from "../api/axios";

export class AxiosChildRepository implements ChildRepository {
    async createChild(data: CreateChildCredentials): Promise<Result<{ id: string; message: string }>> {
        try {
            const response = await api.post<{ id: string; message: string }>("/children", data);
            return Result.ok(response.data);
        } catch (error: any) {
            const message = error.response?.data?.message || "Error al registrar el estudiante";
            return Result.fail(message);
        }
    }

    async getChildren(): Promise<Result<Child[]>> {
        try {
            const response = await api.get<{ data: Child[] }>("transportation/child");
            return Result.ok(response.data.data);
        } catch (error: any) {
            const message = error.response?.data?.message || "Error al obtener la lista de estudiantes";
            return Result.fail(message);
        }
    }
}
