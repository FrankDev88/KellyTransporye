import { Result } from "../models/Result";
import type { User } from "../models/User";
import type { CreateUserCredentials } from "../schemas/userSchema";

export interface UserRepository {
  createUser(data: CreateUserCredentials): Promise<Result<{ id: string; message: string }>>;
  getUsers(): Promise<Result<User[]>>;
}
