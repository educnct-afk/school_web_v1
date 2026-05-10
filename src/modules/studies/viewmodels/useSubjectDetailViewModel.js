import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@core/stores/authStore';
import {
  assignmentService, studyMaterialService, diaryService, noteService,
} from '../services/studiesService';

export function useSubjectDetailViewModel(offeringId) {
  const orgId = useAuthStore((s) => s.organization?.id);
  const userId = useAuthStore((s) => s.user?.id);
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

  const note = useQuery({
    queryKey: ['studies', 'note', offeringId, userId],
    queryFn: () => noteService.byOfferingAndStudent(offeringId, userId),
    enabled: !!offeringId && !!userId,
  });

  const submitAssignment = useMutation({
    mutationFn: ({ assignmentId, payload }) => assignmentService.submit(assignmentId, { ...payload, studentUserId: userId }),
    onSuccess: () => { toast.success('Assignment submitted'); qc.invalidateQueries({ queryKey: ['studies', 'assignments', offeringId] }); },
    onError: (e) => toast.error(e.message),
  });

  const saveNote = useMutation({
    mutationFn: (body) => noteService.upsert(offeringId, { body, studentUserId: userId, organizationId: orgId }),
    onSuccess: () => { toast.success('Note saved'); qc.invalidateQueries({ queryKey: ['studies', 'note', offeringId, userId] }); },
    onError: (e) => toast.error(e.message),
  });

  return { assignments, materials, diary, note, submitAssignment, saveNote, userId, orgId };
}
