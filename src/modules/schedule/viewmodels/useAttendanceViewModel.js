import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { attendanceService } from '../services/scheduleService';
import { useAuthStore } from '@core/stores/authStore';

export function useAttendanceViewModel({ classGroupId, date }) {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['schedule', 'attendance', 'byClassGroupDate', classGroupId, date],
    queryFn: () => attendanceService.byClassGroupAndDate(classGroupId, date),
    enabled: !!classGroupId && !!date,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['schedule', 'attendance'] });

  const markBulk = useMutation({
    mutationFn: (entries) => attendanceService.markBulk({
      organizationId: orgId,
      classGroupId,
      date,
      entries,
    }),
    onSuccess: () => { toast.success('Attendance saved'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return { list, markBulk, orgId };
}
