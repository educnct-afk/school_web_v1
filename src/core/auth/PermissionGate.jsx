import { useAuthStore } from '@core/stores/authStore';
import { hasAny } from './hasPermission';

/**
 * Render children only if the current user has at least one of the listed
 * permissions. Use to hide buttons/menu items without blocking the whole route.
 */
export default function PermissionGate({ anyOf = [], fallback = null, children }) {
  const permissions = useAuthStore((s) => s.permissions);
  if (!anyOf.length) return children;
  return hasAny(permissions, anyOf) ? children : fallback;
}
