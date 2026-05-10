import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../services/iamService';
import { authService } from '@modules/auth/services/authService';
import { useAuthStore } from '@core/stores/authStore';

export function useUsersViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const startImpersonation = useAuthStore((s) => s.startImpersonation);
  const updateMe = useAuthStore((s) => s.updateMe);
  const navigate = useNavigate();
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

  const impersonate = useMutation({
    mutationFn: (userId) => authService.impersonate(userId),
    onSuccess: async (data) => {
      // Swap to the impersonation token, then enrich with /me's permissions.
      startImpersonation({
        token: data.token,
        user: data.user,
        organization: data.organization,
        impersonatorEmail: data.impersonatorEmail,
      });
      try {
        const me = await authService.me();
        updateMe({
          user: me,
          organization: me?.organization,
          permissions: me?.permissions ?? [],
        });
      } catch {
        /* /me failure is non-fatal — banner still shows, basic auth still works */
      }
      // The target user's home page rarely matches the admin's; reset to root.
      qc.clear();
      toast.success(`Signed in as ${data.user?.email ?? 'user'}`);
      navigate('/', { replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, changeRole, remove, impersonate, orgId };
}
