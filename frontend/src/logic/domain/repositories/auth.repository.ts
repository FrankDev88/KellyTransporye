import type { LoginCredentials } from "../schemas/authSchema";
import type { User } from "../models/User";
import { Result } from "../models/Result";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<Result<User>>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
