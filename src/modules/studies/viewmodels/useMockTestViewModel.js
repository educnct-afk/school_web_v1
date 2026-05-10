import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@core/stores/authStore';
import { mockTestService } from '../services/studiesService';

export function useMockTestViewModel(offeringId) {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  const tests = useQuery({
    queryKey: ['studies', 'mock-tests', offeringId, userId],
    queryFn: () => mockTestService.byOfferingAndStudent(userId, offeringId),
    enabled: !!offeringId && !!userId,
  });

  const generate = useMutation({
    mutationFn: ({ topic }) => mockTestService.generate({
      subjectOfferingId: offeringId,
      studentUserId: userId,
      topic,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['studies', 'mock-tests', offeringId, userId] }); },
    onError: (e) => toast.error(e.message ?? 'Failed to generate test'),
  });

  const submitAttempt = useMutation({
    mutationFn: ({ mockTestId, answers }) =>
      mockTestService.submitAttempt(mockTestId, { studentUserId: userId, answers }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['studies', 'mock-tests', offeringId, userId] }); },
    onError: (e) => toast.error(e.message ?? 'Failed to submit attempt'),
  });

  return { tests, generate, submitAttempt, userId };
}

export function useMockTestDetailViewModel(mockTestId) {
  const test = useQuery({
    queryKey: ['studies', 'mock-test', mockTestId],
    queryFn: () => mockTestService.byId(mockTestId),
    enabled: !!mockTestId,
  });

  return { test };
}
