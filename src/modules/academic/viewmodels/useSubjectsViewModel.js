import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subjectService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useSubjectsViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['academic', 'subjects', 'byOrg', orgId],
    queryFn: () => subjectService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return subjectService.create({ ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Subject created'); qc.invalidateQueries({ queryKey: ['academic', 'subjects'] }); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return subjectService.update(id, cleaned);
    },
    onSuccess: () => { toast.success('Subject updated'); qc.invalidateQueries({ queryKey: ['academic', 'subjects'] }); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => subjectService.remove(id),
    onSuccess: () => { toast.success('Subject deleted'); qc.invalidateQueries({ queryKey: ['academic', 'subjects'] }); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
