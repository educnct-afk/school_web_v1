import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { guardianService } from '../services/academicService';
import { useAuthStore } from '@core/stores/authStore';

export function useGuardiansViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  // Creates a new guardian account then immediately links them to a student.
  const createAndLink = useMutation({
    mutationFn: async ({ guardianPayload, studentUserId, relationship, isPrimary }) => {
      const cleaned = Object.fromEntries(Object.entries(guardianPayload).filter(([, v]) => v !== ''));
      const guardian = await guardianService.create({ ...cleaned, organizationId: orgId });
      return guardianService.linkStudent(guardian.userId, { studentUserId, relationship, isPrimary });
    },
    onSuccess: () => {
      toast.success('Guardian added and linked to student');
      qc.invalidateQueries({ queryKey: ['academic', 'guardians'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { createAndLink };
}
