import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  redirectTo: string;
}

export default function ProtectedRoute({ children, requiredRole, redirectTo }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
