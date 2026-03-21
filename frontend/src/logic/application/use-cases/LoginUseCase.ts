import type { AuthRepository } from "../../domain/repositories/auth.repository";
import type { LoginCredentials } from "../../domain/schemas/authSchema";
import type { User } from "../../domain/models/User";
import { Result } from "../../domain/models/Result";

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<Result<User>> {
    const result = await this.authRepository.login(credentials);
    return result;
  }
}
