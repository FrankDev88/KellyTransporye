import { useMutation } from "@tanstack/react-query";
import { LoginUseCase } from "../../use-cases/LoginUseCase";
import { AxiosAuthRepository } from "../../../infrastructure/repositories/AxiosAuthRepository";
import type { LoginCredentials } from "../../../domain/schemas/authSchema";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const authRepository = new AxiosAuthRepository();
const loginUseCase = new LoginUseCase(authRepository);

export const useLoginMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUseCase.execute(credentials),
    onSuccess: (result) => {
      if (result.isSuccess) {
        setUser(result.getValue());
        toast.success("Login successful");
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Login failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "An unexpected error occurred");
    },
  });
};
