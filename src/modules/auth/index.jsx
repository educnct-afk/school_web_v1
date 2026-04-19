import { Route } from 'react-router-dom';
import PublicRoute from '@core/router/PublicRoute';
import ProtectedRoute from '@core/router/ProtectedRoute';
import AppShell from '@core/ui/layouts/AppShell';
import LoginPage from './ui/LoginPage';
import ForgotPasswordPage from './ui/ForgotPasswordPage';
import ResetPasswordPage from './ui/ResetPasswordPage';
import SessionsPage from './ui/SessionsPage';
import { isModuleEnabled, isFeatureEnabled, FEATURES } from '@core/features/featureFlags';

const moduleOn = isModuleEnabled('AUTH');

export const authRoutes = moduleOn ? (
  <>
    {isFeatureEnabled('AUTH', FEATURES.AUTH.LOGIN) && (
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    )}
    {isFeatureEnabled('AUTH', FEATURES.AUTH.PASSWORD_RESET) && (
      <>
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      </>
    )}
    {isFeatureEnabled('AUTH', FEATURES.AUTH.SESSIONS) && (
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/my-sessions" element={<SessionsPage />} />
      </Route>
    )}
  </>
) : null;
