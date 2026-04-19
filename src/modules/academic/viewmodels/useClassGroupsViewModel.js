import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { classGroupService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useClassGroupsViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['academic', 'class-groups', 'byOrg', orgId],
    queryFn: () => classGroupService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => classGroupService.create({ ...payload, organizationId: orgId }),
    onSuccess: () => { toast.success('Class group created'); qc.invalidateQueries({ queryKey: ['academic', 'class-groups'] }); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => classGroupService.update(id, payload),
    onSuccess: () => { toast.success('Class group updated'); qc.invalidateQueries({ queryKey: ['academic', 'class-groups'] }); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => classGroupService.remove(id),
    onSuccess: () => { toast.success('Class group deleted'); qc.invalidateQueries({ queryKey: ['academic', 'class-groups'] }); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
