import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@core/stores/authStore';
import { api, unwrap } from '@core/api/client';

export function useTeacherClassesViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const userId = useAuthStore((s) => s.user?.id);

  const classGroups = useQuery({
    queryKey: ['academic', 'class-groups', 'byOrg', orgId],
    queryFn: () => api.get(`/api/class-groups/org/${orgId}`).then(unwrap),
    enabled: !!orgId,
  });

  return { classGroups, orgId, userId };
}
