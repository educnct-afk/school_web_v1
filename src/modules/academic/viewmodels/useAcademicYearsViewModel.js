import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { academicYearService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useAcademicYearsViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['academic', 'academic-years', 'byOrg', orgId],
    queryFn: () => academicYearService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => academicYearService.create({ ...payload, organizationId: orgId }),
    onSuccess: () => { toast.success('Academic year created'); qc.invalidateQueries({ queryKey: ['academic', 'academic-years'] }); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => academicYearService.update(id, payload),
    onSuccess: () => { toast.success('Academic year updated'); qc.invalidateQueries({ queryKey: ['academic', 'academic-years'] }); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => academicYearService.remove(id),
    onSuccess: () => { toast.success('Academic year deleted'); qc.invalidateQueries({ queryKey: ['academic', 'academic-years'] }); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
