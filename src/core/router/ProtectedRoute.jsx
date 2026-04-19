import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@core/stores/authStore';
import { hasAny } from '@core/auth/hasPermission';

export default function ProtectedRoute({ children, anyOf = [] }) {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const permissions = useAuthStore((s) => s.permissions);
  const location = useLocation();

  if (!hydrated) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (anyOf.length && !hasAny(permissions, anyOf)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}
