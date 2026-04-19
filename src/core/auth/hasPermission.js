/**
 * Permission check mirroring the server-side AuthenticatedUser.hasPermission.
 * Permission format: "module:resource:action".
 * Supports wildcards: "*:*:*", "module:*:*", "module:resource:*".
 */
export function hasPermission(permissions, required) {
  if (!permissions?.length) return false;
  if (permissions.includes('*:*:*')) return true;
  if (permissions.includes(required)) return true;
  const parts = required.split(':');
  if (parts.length !== 3) return false;
  if (permissions.includes(`${parts[0]}:*:*`)) return true;
  if (permissions.includes(`${parts[0]}:${parts[1]}:*`)) return true;
  return false;
}

export function hasAny(permissions, required) {
  return required.some((p) => hasPermission(permissions, p));
}
