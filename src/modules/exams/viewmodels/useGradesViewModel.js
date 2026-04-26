import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gradeService } from '../services/examsService';
import { useAuthStore } from '@core/stores/authStore';

export function useGradesViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['exams', 'grades', 'byOrg', orgId],
    queryFn: () => gradeService.byOrg(orgId),
    enabled: !!orgId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['exams', 'grades'] });

  const create = useMutation({
    mutationFn: (payload) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return gradeService.create({ ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Grade recorded'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return gradeService.update(id, cleaned);
    },
    onSuccess: () => { toast.success('Grade updated'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => gradeService.remove(id),
    onSuccess: () => { toast.success('Grade removed'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
