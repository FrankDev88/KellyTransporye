import { Result } from "../../domain/models/Result";
import type { User } from "../../domain/models/User";
import type { UserRepository } from "../../domain/repositories/user.repository";
import type { CreateUserCredentials } from "../../domain/schemas/userSchema";
import { api } from "../api/axios";



export class AxiosUserRepository implements UserRepository {
  async createUser(data: CreateUserCredentials): Promise<Result<{ id: string; message: string }>> {
    try {
      const response = await api.post<{ id: string; message: string }>("/users", data);
      return Result.ok(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al crear el usuario";
      return Result.fail(message);
    }
  }

  async getUsers(): Promise<Result<User[]>> {
    try {
      const response = await api.get<{ data: User[] }>("/users");
      return Result.ok(response.data.data);
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al obtener los usuarios";
      return Result.fail(message);
    }
  }
}
