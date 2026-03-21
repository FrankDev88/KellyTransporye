import { Result } from "../../domain/models/Result";
import type { UserRepository } from "../../domain/repositories/user.repository";
import type { CreateUserCredentials } from "../../domain/schemas/userSchema";

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: CreateUserCredentials): Promise<Result<{ id: string; message: string }>> {
    return this.userRepository.createUser(data);
  }
}
