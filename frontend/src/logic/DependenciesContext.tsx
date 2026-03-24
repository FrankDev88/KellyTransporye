import { createContext, useContext, type ReactNode } from "react";
import { dependencies, type Dependencies } from "./CompositionRoot";

const DependenciesContext = createContext<Dependencies | null>(null);

export function DependenciesProvider({ children }: { children: ReactNode }) {
  return (
    <DependenciesContext.Provider value={dependencies}>
      {children}
    </DependenciesContext.Provider>
  );
}

export function useDependencies() {
  const context = useContext(DependenciesContext);
  if (!context) {
    throw new Error("useDependencies must be used within a DependenciesProvider");
  }
  return context;
}
