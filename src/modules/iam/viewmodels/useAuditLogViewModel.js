import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '../services/iamService';
import { useAuthStore } from '@core/stores/authStore';

export function useAuditLogViewModel(params = {}) {
  const orgId = useAuthStore((s) => s.organization?.id);

  const list = useQuery({
    queryKey: ['iam', 'audit-logs', 'byOrg', orgId, params],
    queryFn: () => auditLogService.byOrg(orgId, params),
    enabled: !!orgId,
  });

  return { list, orgId };
}

export function useUserAuditLogViewModel(userId) {
  const list = useQuery({
    queryKey: ['iam', 'audit-logs', 'byUser', userId],
    queryFn: () => auditLogService.byUser(userId),
    enabled: !!userId,
  });

  return { list };
}
