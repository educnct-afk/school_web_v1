import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@core/stores/authStore';

export default function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  if (!hydrated) return null;
  if (token) return <Navigate to="/" replace />;
  return children;
}
