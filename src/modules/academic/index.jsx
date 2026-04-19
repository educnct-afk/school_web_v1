import { Route } from 'react-router-dom';
import StudentsPage from './ui/StudentsPage';
import StaffPage from './ui/StaffPage';
import ClassGroupsPage from './ui/ClassGroupsPage';
import SubjectsPage from './ui/SubjectsPage';
import DepartmentsPage from './ui/DepartmentsPage';
import AcademicYearsPage from './ui/AcademicYearsPage';
import ClassroomsPage from './ui/ClassroomsPage';
import { isModuleEnabled, isFeatureEnabled, FEATURES } from '@core/features/featureFlags';

const moduleOn = isModuleEnabled('ACADEMIC');

export const academicRoutes = moduleOn ? (
  <>
    {isFeatureEnabled('ACADEMIC', FEATURES.ACADEMIC.STUDENTS) && (
      <Route path="/students" element={<StudentsPage />} />
    )}
    {isFeatureEnabled('ACADEMIC', FEATURES.ACADEMIC.STAFF) && (
      <Route path="/staff" element={<StaffPage />} />
    )}
    {isFeatureEnabled('ACADEMIC', FEATURES.ACADEMIC.CLASS_GROUPS) && (
      <Route path="/class-groups" element={<ClassGroupsPage />} />
    )}
    {isFeatureEnabled('ACADEMIC', FEATURES.ACADEMIC.SUBJECTS) && (
      <Route path="/subjects" element={<SubjectsPage />} />
    )}
    {isFeatureEnabled('ACADEMIC', FEATURES.ACADEMIC.DEPARTMENTS) && (
      <Route path="/departments" element={<DepartmentsPage />} />
    )}
    {isFeatureEnabled('ACADEMIC', FEATURES.ACADEMIC.ACADEMIC_YEARS) && (
      <Route path="/academic-years" element={<AcademicYearsPage />} />
    )}
    {isFeatureEnabled('ACADEMIC', FEATURES.ACADEMIC.CLASSROOMS) && (
      <Route path="/classrooms" element={<ClassroomsPage />} />
    )}
  </>
) : null;
