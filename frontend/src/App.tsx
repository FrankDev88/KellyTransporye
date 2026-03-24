import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import UsersPage from "@/pages/users/UsersPage";
import ChildrenPage from "@/pages/children/ChildrenPage";
import RoutesPage from "@/pages/routes/RoutesPage";
import TripsPage from "@/pages/routes/TripsPage";
import DriverPage from "@/pages/driver/DriverPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/children" element={<ChildrenPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/driver" element={<DriverPage />} />
          <Route path="/driver/:tripId" element={<DriverPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
