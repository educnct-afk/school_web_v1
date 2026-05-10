import { Route } from 'react-router-dom';
import { isModuleEnabled, isFeatureEnabled, FEATURES } from '@core/features/featureFlags';
import WorkspaceRouter from './ui/WorkspaceRouter';
import SubjectDetailPage from './ui/SubjectDetailPage';
import MockTestGeneratePage from './ui/MockTestGeneratePage';
import MockTestAttemptPage from './ui/MockTestAttemptPage';
import TeacherClassesPage from './ui/TeacherClassesPage';
import TeacherSubjectPage from './ui/TeacherSubjectPage';
import TeacherRoutinePage from './ui/TeacherRoutinePage';
import TeacherAssignmentsPage from './ui/TeacherAssignmentsPage';
import TeacherClassPage from './ui/TeacherClassPage';
import TeacherReportCardsPage from './ui/TeacherReportCardsPage';

const moduleOn = isModuleEnabled('STUDIES');

export const studiesRoutes = moduleOn ? (
  <>
    {isFeatureEnabled('STUDIES', FEATURES.STUDIES.WORKSPACE) && (
      <>
        <Route path="/workspace" element={<WorkspaceRouter />} />
        <Route path="/workspace/routine" element={<TeacherRoutinePage />} />
        <Route path="/workspace/assignments" element={<TeacherAssignmentsPage />} />
        <Route path="/workspace/my-class" element={<TeacherClassPage />} />
        <Route path="/workspace/report-cards" element={<TeacherReportCardsPage />} />
        <Route path="/workspace/subject/:offeringId" element={<SubjectDetailPage />} />
        {isFeatureEnabled('STUDIES', FEATURES.STUDIES.MOCK_TEST) && (
          <>
            <Route path="/workspace/subject/:offeringId/mock-test/new" element={<MockTestGeneratePage />} />
            <Route path="/workspace/subject/:offeringId/mock-test/:mockTestId" element={<MockTestAttemptPage />} />
          </>
        )}
      </>
    )}
    {isFeatureEnabled('STUDIES', FEATURES.STUDIES.TEACHER_CONTENT) && (
      <>
        <Route path="/teacher/classes" element={<TeacherClassesPage />} />
        <Route path="/teacher/class/:classGroupId/subject/:offeringId" element={<TeacherSubjectPage />} />
        <Route path="/teacher/class/:classGroupId" element={<TeacherClassesPage />} />
      </>
    )}
  </>
) : null;
