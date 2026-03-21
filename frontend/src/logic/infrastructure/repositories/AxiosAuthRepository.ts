import type { AuthRepository } from "../../domain/repositories/auth.repository";
import type { LoginCredentials } from "../../domain/schemas/authSchema";
import type { User } from "../../domain/models/User";
import { Result } from "../../domain/models/Result";
import { api } from "../api/axios";

export class AxiosAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<Result<User>> {
    try {
      const response = await api.post<{ data: User; token: string }>("/auth/login", credentials);
      const user = response.data.data;
      const token = response.data.token;

      if (token) {
        localStorage.setItem("auth_token", token);
        user.token = token;
      }

      return Result.ok(user);
    } catch (error: any) {
      const message = error.response?.data?.message || "Error during login";
      return Result.fail(message);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const response = await api.get<{ data: User }>("/auth/me");
      return response.data.data;
    } catch {
      localStorage.removeItem("auth_token");
      return null;
    }
  }
}
