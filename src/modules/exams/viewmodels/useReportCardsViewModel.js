import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reportCardService } from '../services/examsService';
import { useAuthStore } from '@core/stores/authStore';

export function useReportCardsViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['exams', 'report-cards', 'byOrg', orgId],
    queryFn: () => reportCardService.byOrg(orgId),
    enabled: !!orgId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['exams', 'report-cards'] });

  const create = useMutation({
    mutationFn: (payload) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return reportCardService.create({ ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Report card created'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return reportCardService.update(id, cleaned);
    },
    onSuccess: () => { toast.success('Report card updated'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => reportCardService.remove(id),
    onSuccess: () => { toast.success('Report card removed'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
