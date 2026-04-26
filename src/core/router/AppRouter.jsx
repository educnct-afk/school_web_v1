import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '@core/ui/layouts/AppShell';
import NotFoundPage from '@core/ui/pages/NotFoundPage';
import ForbiddenPage from '@core/ui/pages/ForbiddenPage';
import HomePage from '@core/ui/pages/HomePage';
import { authRoutes } from '@modules/auth';
import { iamRoutes } from '@modules/iam';
import { academicRoutes } from '@modules/academic';
import { scheduleRoutes } from '@modules/schedule';
import { examsRoutes } from '@modules/exams';

export default function AppRouter() {
  return (
    <Routes>
      {authRoutes /* public: /login, /forgot-password, etc. */}

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        {iamRoutes}
        {academicRoutes}
        {scheduleRoutes}
        {examsRoutes}
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
