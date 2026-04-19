import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userProfileService } from '../services/iamService';
import { useAuthStore } from '@core/stores/authStore';

export function useProfileViewModel(userIdOverride) {
  const selfId = useAuthStore((s) => s.user?.id);
  const userId = userIdOverride ?? selfId;
  const qc = useQueryClient();

  const profile = useQuery({
    queryKey: ['iam', 'users', userId, 'profile'],
    queryFn: () => userProfileService.get(userId),
    enabled: !!userId,
  });

  const save = useMutation({
    mutationFn: (payload) => userProfileService.upsert(userId, payload),
    onSuccess: () => {
      toast.success('Profile saved');
      qc.invalidateQueries({ queryKey: ['iam', 'users', userId, 'profile'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { profile, save, userId };
}
