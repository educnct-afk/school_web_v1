import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../services/iamService';
import { useAuthStore } from '@core/stores/authStore';

export function useUsersViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['iam', 'users', 'byOrg', orgId],
    queryFn: () => userService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => userService.create({ ...payload, organizationId: orgId }),
    onSuccess: () => {
      toast.success('User created');
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, roleId }) => userService.changeRole(id, roleId),
    onSuccess: () => {
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => userService.remove(id),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, changeRole, remove, orgId };
}
