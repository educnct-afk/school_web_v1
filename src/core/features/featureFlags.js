/**
 * Two-tier feature flag system.
 *
 *   - Module flags: VITE_MODULE_<NAME>  (e.g. VITE_MODULE_AUTH=true)
 *   - Feature flags: VITE_<MODULE>_<FEATURE>  (e.g. VITE_IAM_USERS=true)
 *
 * A feature is "on" only if BOTH its module flag AND its own flag are truthy.
 * Defaults to true when the flag is undefined so that new features can ship
 * without requiring every environment to set them explicitly.
 */

const truthy = (v) => v !== 'false' && v !== '0' && v !== false && v != null;

export function isModuleEnabled(name) {
  const key = `VITE_MODULE_${name.toUpperCase()}`;
  return truthy(import.meta.env[key] ?? 'true');
}

export function isFeatureEnabled(moduleName, featureName) {
  if (!isModuleEnabled(moduleName)) return false;
  const key = `VITE_${moduleName.toUpperCase()}_${featureName.toUpperCase().replace(/-/g, '_')}`;
  return truthy(import.meta.env[key] ?? 'true');
}

export const FEATURES = {
  AUTH: {
    LOGIN: 'login',
    PASSWORD_RESET: 'password-reset',
    SESSIONS: 'sessions',
  },
  IAM: {
    USERS: 'users',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
    ORGANIZATIONS: 'organizations',
    AUDIT_LOG: 'audit-log',
    PROFILE: 'profile',
  },
  ACADEMIC: {
    DEPARTMENTS: 'departments',
    ACADEMIC_YEARS: 'academic-years',
    TERMS: 'terms',
    CLASS_GROUPS: 'class-groups',
    SUBJECTS: 'subjects',
    CLASSROOMS: 'classrooms',
    STUDENTS: 'students',
    STAFF: 'staff',
    GUARDIANS: 'guardians',
  },
};
