import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { examScheduleService } from '../services/examsService';
import { useAuthStore } from '@core/stores/authStore';

export function useExamSchedulesViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['exams', 'exam-schedules', 'byOrg', orgId],
    queryFn: () => examScheduleService.byOrg(orgId),
    enabled: !!orgId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['exams', 'exam-schedules'] });

  const create = useMutation({
    mutationFn: (payload) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return examScheduleService.create({ ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Exam schedule created'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return examScheduleService.update(id, cleaned);
    },
    onSuccess: () => { toast.success('Exam schedule updated'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => examScheduleService.remove(id),
    onSuccess: () => { toast.success('Exam schedule removed'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
