import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useStudentsViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['academic', 'students', 'byOrg', orgId],
    queryFn: () => studentService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return studentService.create({ ...cleaned, organizationId: orgId });
    },
    onSuccess: () => { toast.success('Student created'); qc.invalidateQueries({ queryKey: ['academic', 'students'] }); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ userId, payload }) => {
      const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));
      return studentService.update(userId, cleaned);
    },
    onSuccess: () => { toast.success('Student updated'); qc.invalidateQueries({ queryKey: ['academic', 'students'] }); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (userId) => studentService.remove(userId),
    onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries({ queryKey: ['academic', 'students'] }); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
