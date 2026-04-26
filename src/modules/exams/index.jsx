import { Route } from 'react-router-dom';
import ExamSchedulesPage from './ui/ExamSchedulesPage';
import GradesPage from './ui/GradesPage';
import ReportCardsPage from './ui/ReportCardsPage';
import { isModuleEnabled, isFeatureEnabled, FEATURES } from '@core/features/featureFlags';

const moduleOn = isModuleEnabled('EXAMS');

export const examsRoutes = moduleOn ? (
  <>
    {isFeatureEnabled('EXAMS', FEATURES.EXAMS.EXAM_SCHEDULES) && (
      <Route path="/exam-schedules" element={<ExamSchedulesPage />} />
    )}
    {isFeatureEnabled('EXAMS', FEATURES.EXAMS.GRADES) && (
      <Route path="/grades" element={<GradesPage />} />
    )}
    {isFeatureEnabled('EXAMS', FEATURES.EXAMS.REPORT_CARDS) && (
      <Route path="/report-cards" element={<ReportCardsPage />} />
    )}
  </>
) : null;
