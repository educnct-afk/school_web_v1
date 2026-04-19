import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { departmentService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useDepartmentsViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['academic', 'departments', 'byOrg', orgId],
    queryFn: () => departmentService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => departmentService.create({ ...payload, organizationId: orgId }),
    onSuccess: () => { toast.success('Department created'); qc.invalidateQueries({ queryKey: ['academic', 'departments'] }); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => departmentService.update(id, payload),
    onSuccess: () => { toast.success('Department updated'); qc.invalidateQueries({ queryKey: ['academic', 'departments'] }); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => departmentService.remove(id),
    onSuccess: () => { toast.success('Department deleted'); qc.invalidateQueries({ queryKey: ['academic', 'departments'] }); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
