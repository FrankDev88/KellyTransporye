import { useMutation } from "@tanstack/react-query";
import type { LoginCredentials } from "../../../domain/schemas/authSchema";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDependencies } from "../../../DependenciesContext";

export const useLoginMutation = () => {
  const { loginUseCase } = useDependencies();
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
