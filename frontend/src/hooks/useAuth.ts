import { useEffect, useState } from "react";
import { useAuthStore } from "../logic/application/store/useAuthStore";
import { useDependencies } from "../logic/DependenciesContext";

export const useAuth = () => {
  const { getCurrentUserUseCase } = useDependencies();
  const setUser = useAuthStore((state) => state.setUser);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const user = await getCurrentUserUseCase.execute();
          if (user) {
            setUser(user);
          } else {
            // Token was invalid or user not found
            localStorage.removeItem("auth_token");
          }
        } catch (error) {
          console.error("Error during auth initialization:", error);
          localStorage.removeItem("auth_token");
        }
      }
      setIsInitializing(false);
    };

    initAuth();
  }, [getCurrentUserUseCase, setUser]);

  return { isInitializing };
};
