import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { classroomService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useClassroomsViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['academic', 'classrooms', 'byOrg', orgId],
    queryFn: () => classroomService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => classroomService.create({ ...payload, organizationId: orgId }),
    onSuccess: () => { toast.success('Classroom created'); qc.invalidateQueries({ queryKey: ['academic', 'classrooms'] }); },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => classroomService.update(id, payload),
    onSuccess: () => { toast.success('Classroom updated'); qc.invalidateQueries({ queryKey: ['academic', 'classrooms'] }); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => classroomService.remove(id),
    onSuccess: () => { toast.success('Classroom deleted'); qc.invalidateQueries({ queryKey: ['academic', 'classrooms'] }); },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove, orgId };
}
