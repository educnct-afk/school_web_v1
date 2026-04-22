import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { staffService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useStaffViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['academic', 'staff', 'byOrg', orgId],
    queryFn: () => staffService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return staffService.create({ ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Staff created'); qc.invalidateQueries({ queryKey: ['academic', 'staff'] }); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ userId, payload }) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return staffService.update(userId, cleaned);
    },
    onSuccess: () => { toast.success('Staff updated'); qc.invalidateQueries({ queryKey: ['academic', 'staff'] }); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (userId) => staffService.remove(userId),
    onSuccess: () => { toast.success('Staff deleted'); qc.invalidateQueries({ queryKey: ['academic', 'staff'] }); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
