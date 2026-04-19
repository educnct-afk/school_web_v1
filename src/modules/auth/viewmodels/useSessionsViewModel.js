import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sessionService } from '../services/authService';
import { useAuthStore } from '@core/stores/authStore';

export function useSessionsViewModel() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['auth', 'sessions', userId],
    queryFn: () => sessionService.listMine(userId),
    enabled: !!userId,
  });

  const revoke = useMutation({
    mutationFn: (id) => sessionService.revoke(id),
    onSuccess: () => {
      toast.success('Session revoked');
      qc.invalidateQueries({ queryKey: ['auth', 'sessions', userId] });
    },
    onError: (e) => toast.error(e.message),
  });

  const revokeAll = useMutation({
    mutationFn: () => sessionService.revokeAll(userId),
    onSuccess: () => {
      toast.success('All sessions revoked');
      qc.invalidateQueries({ queryKey: ['auth', 'sessions', userId] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { list, revoke, revokeAll };
}
