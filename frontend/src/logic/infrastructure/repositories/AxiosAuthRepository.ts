import type { AuthRepository } from "../../domain/repositories/auth.repository";
import type { LoginCredentials } from "../../domain/schemas/authSchema";
import type { User } from "../../domain/models/User";
import { Result } from "../../domain/models/Result";
import { api } from "../api/axios";

export class AxiosAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<Result<User>> {
    try {
      // Backend returns: { accessToken: string, user: { id, email, role, fullName } }
      const response = await api.post<{ accessToken: string; user: User }>(
        "/auth/login",
        credentials
      );
      const user = response.data.user;
      const token = response.data.accessToken;

      if (token) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
      }

      return Result.ok(user);
    } catch (error: any) {
      const message = error.response?.data?.message || "Credenciales inválidas.";
      return Result.fail(message);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    
    if (!token || !userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      return null;
    }
  }
}
