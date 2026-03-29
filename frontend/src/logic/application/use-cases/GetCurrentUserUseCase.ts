import type { AuthRepository } from "../../domain/repositories/auth.repository";
import type { User } from "../../domain/models/User";

export class GetCurrentUserUseCase {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<User | null> {
    return await this.authRepository.getCurrentUser();
  }
}
