import { Route } from 'react-router-dom';
import UsersPage from './ui/UsersPage';
import RolesPage from './ui/RolesPage';
import PermissionsPage from './ui/PermissionsPage';
import OrganizationsPage from './ui/OrganizationsPage';
import AuditLogPage from './ui/AuditLogPage';
import ProfilePage from './ui/ProfilePage';
import { isModuleEnabled, isFeatureEnabled, FEATURES } from '@core/features/featureFlags';

const moduleOn = isModuleEnabled('IAM');

export const iamRoutes = moduleOn ? (
  <>
    {isFeatureEnabled('IAM', FEATURES.IAM.USERS) && (
      <Route path="/users" element={<UsersPage />} />
    )}
    {isFeatureEnabled('IAM', FEATURES.IAM.ROLES) && (
      <Route path="/roles" element={<RolesPage />} />
    )}
    {isFeatureEnabled('IAM', FEATURES.IAM.PERMISSIONS) && (
      <Route path="/permissions" element={<PermissionsPage />} />
    )}
    {isFeatureEnabled('IAM', FEATURES.IAM.ORGANIZATIONS) && (
      <Route path="/organizations" element={<OrganizationsPage />} />
    )}
    {isFeatureEnabled('IAM', FEATURES.IAM.AUDIT_LOG) && (
      <Route path="/audit-log" element={<AuditLogPage />} />
    )}
    {isFeatureEnabled('IAM', FEATURES.IAM.PROFILE) && (
      <Route path="/profile" element={<ProfilePage />} />
    )}
  </>
) : null;
