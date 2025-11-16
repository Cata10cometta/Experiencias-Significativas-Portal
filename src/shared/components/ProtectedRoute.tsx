// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { getToken } from "../../Api/Services/Auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "teacher";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = getToken();
  const storedRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role && storedRole !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
