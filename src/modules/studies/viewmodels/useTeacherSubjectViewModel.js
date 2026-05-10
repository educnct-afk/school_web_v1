import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@core/stores/authStore';
import { assignmentService, studyMaterialService, diaryService } from '../services/studiesService';

export function useTeacherSubjectViewModel(offeringId) {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const assignments = useQuery({
    queryKey: ['studies', 'assignments', offeringId],
    queryFn: () => assignmentService.byOffering(offeringId),
    enabled: !!offeringId,
  });

  const materials = useQuery({
    queryKey: ['studies', 'materials', offeringId],
    queryFn: () => studyMaterialService.byOffering(offeringId),
    enabled: !!offeringId,
  });

  const diary = useQuery({
    queryKey: ['studies', 'diary', offeringId],
    queryFn: () => diaryService.byOffering(offeringId),
    enabled: !!offeringId,
  });

  const createAssignment = useMutation({
    mutationFn: (payload) => assignmentService.create({ ...payload, organizationId: orgId, subjectOfferingId: offeringId }),
    onSuccess: () => { toast.success('Assignment created'); qc.invalidateQueries({ queryKey: ['studies', 'assignments', offeringId] }); },
    onError: (e) => toast.error(e.message),
  });

  const createMaterial = useMutation({
    mutationFn: (payload) => studyMaterialService.create({ ...payload, organizationId: orgId, subjectOfferingId: offeringId }),
    onSuccess: () => { toast.success('Material posted'); qc.invalidateQueries({ queryKey: ['studies', 'materials', offeringId] }); },
    onError: (e) => toast.error(e.message),
  });

  const createDiary = useMutation({
    mutationFn: (payload) => diaryService.create({ ...payload, organizationId: orgId, subjectOfferingId: offeringId }),
    onSuccess: () => { toast.success('Diary entry created'); qc.invalidateQueries({ queryKey: ['studies', 'diary', offeringId] }); },
    onError: (e) => toast.error(e.message),
  });

  return { assignments, materials, diary, createAssignment, createMaterial, createDiary, orgId };
}
