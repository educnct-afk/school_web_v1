import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@core/stores/authStore';
import { subjectOfferingService, assignmentService } from '../services/studiesService';

export function useStudentWorkspaceViewModel() {
  const userId = useAuthStore((s) => s.user?.id);

  const offerings = useQuery({
    queryKey: ['studies', 'offerings', 'byStudent', userId],
    queryFn: () => subjectOfferingService.byStudent(userId),
    enabled: !!userId,
  });

  return { offerings, userId };
}
