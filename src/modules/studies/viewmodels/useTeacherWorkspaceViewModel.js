import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@core/stores/authStore';
import { timetableService } from '@modules/schedule/services/scheduleService';
import { classGroupService, staffService } from '@modules/academic/services/academicService';
import { reportCardService } from '@modules/exams/services/examsService';
import { assignmentService } from '../services/studiesService';

/**
 * Aggregates everything the Teacher Workspace hub renders. Each widget has its own
 * isLoading/isError so partial failures (e.g. report cards 403) don't blank the page.
 */
export function useTeacherWorkspaceViewModel() {
  const userId = useAuthStore((s) => s.user?.id);
  const orgId = useAuthStore((s) => s.organization?.id);

  const routine = useQuery({
    queryKey: ['workspace', 'teacher', 'routine', userId],
    queryFn: () => timetableService.byTeacher(userId),
    enabled: !!userId,
  });

  const subjects = useQuery({
    queryKey: ['workspace', 'teacher', 'subjects', userId],
    queryFn: () => staffService.assignments(userId),
    enabled: !!userId,
  });

  const myClasses = useQuery({
    queryKey: ['workspace', 'teacher', 'my-classes', userId],
    queryFn: () => classGroupService.byClassTeacher(userId),
    enabled: !!userId,
  });

  const assignments = useQuery({
    queryKey: ['workspace', 'teacher', 'assignments', userId],
    queryFn: () => assignmentService.byTeacher(userId),
    enabled: !!userId,
  });

  const reportCards = useQuery({
    queryKey: ['workspace', 'teacher', 'report-cards', orgId],
    queryFn: () => reportCardService.byOrg(orgId),
    enabled: !!orgId,
    retry: false,
  });

  return { userId, orgId, routine, subjects, myClasses, assignments, reportCards };
}
