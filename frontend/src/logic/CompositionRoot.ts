// 1. Infraestructura (Concrete Implementations)
import { AxiosAuthRepository } from "./infrastructure/repositories/AxiosAuthRepository";
import { AxiosUserRepository } from "./infrastructure/repositories/AxiosUserRepository";
import { AxiosChildRepository } from "./infrastructure/repositories/AxiosChildRepository";
import { AxiosRouteRepository } from "./infrastructure/repositories/AxiosRouteRepository";

// 2. Casos de Uso (Business Logic)
import { LoginUseCase } from "./application/use-cases/LoginUseCase";
import { CreateUserUseCase } from "./application/use-cases/CreateUserUseCase";
import { GetCurrentUserUseCase } from "./application/use-cases/GetCurrentUserUseCase";

// --- Composición de Dependencias ---

// a. Repositorios
const authRepository = new AxiosAuthRepository();
const userRepository = new AxiosUserRepository();
const childRepository = new AxiosChildRepository();
const routeRepository = new AxiosRouteRepository();

// b. Instancias de Casos de Uso (Inyección de dependencias)
export const loginUseCase = new LoginUseCase(authRepository);
export const createUserUseCase = new CreateUserUseCase(userRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

// c. Objeto contenedor para el contexto
export const dependencies = {
  loginUseCase,
  createUserUseCase,
  getCurrentUserUseCase,
  userRepository, // Para consultas directas si fuera necesario
  childRepository,
  routeRepository,
};

export type Dependencies = typeof dependencies;
