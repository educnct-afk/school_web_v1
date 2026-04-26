import { Route } from 'react-router-dom';
import TimetablePage from './ui/TimetablePage';
import AttendancePage from './ui/AttendancePage';
import { isModuleEnabled, isFeatureEnabled, FEATURES } from '@core/features/featureFlags';

const moduleOn = isModuleEnabled('SCHEDULE');

export const scheduleRoutes = moduleOn ? (
  <>
    {isFeatureEnabled('SCHEDULE', FEATURES.SCHEDULE.TIMETABLE) && (
      <Route path="/timetable" element={<TimetablePage />} />
    )}
    {isFeatureEnabled('SCHEDULE', FEATURES.SCHEDULE.ATTENDANCE) && (
      <Route path="/attendance" element={<AttendancePage />} />
    )}
  </>
) : null;
