import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { timetableService } from '../services/scheduleService';
import { useAuthStore } from '@core/stores/authStore';

export function useTimetableViewModel(classGroupId) {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['schedule', 'timetable', 'byClassGroup', classGroupId],
    queryFn: () => timetableService.byClassGroup(classGroupId),
    enabled: !!classGroupId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['schedule', 'timetable'] });

  const create = useMutation({
    mutationFn: (payload) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return timetableService.create({ ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Slot added'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return timetableService.update(id, { ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Slot updated'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => timetableService.remove(id),
    onSuccess: () => { toast.success('Slot removed'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
