import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { roleService } from '../services/iamService';
import { useAuthStore } from '@core/stores/authStore';

export function useRolesViewModel() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['iam', 'roles', 'byOrg', orgId],
    queryFn: () => roleService.byOrg(orgId),
    enabled: !!orgId,
  });

  const create = useMutation({
    mutationFn: (payload) => roleService.create({ ...payload, organizationId: orgId }),
    onSuccess: () => {
      toast.success('Role created');
      qc.invalidateQueries({ queryKey: ['iam', 'roles'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => roleService.update(id, payload),
    onSuccess: () => {
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['iam', 'roles'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => roleService.remove(id),
    onSuccess: () => {
      toast.success('Role deleted');
      qc.invalidateQueries({ queryKey: ['iam', 'roles'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove };
}

export function useRolePermissionsViewModel(roleId) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['iam', 'roles', roleId, 'permissions'],
    queryFn: () => roleService.permissions(roleId),
    enabled: !!roleId,
  });

  const grant = useMutation({
    mutationFn: (permissionId) => roleService.grant(roleId, permissionId),
    onSuccess: () => {
      toast.success('Permission granted');
      qc.invalidateQueries({ queryKey: ['iam', 'roles', roleId, 'permissions'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: (permissionId) => roleService.revoke(roleId, permissionId),
    onSuccess: () => {
      toast.success('Permission revoked');
      qc.invalidateQueries({ queryKey: ['iam', 'roles', roleId, 'permissions'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { list, grant, revoke };
}
