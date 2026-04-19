import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { organizationService } from '../services/iamService';

export function useOrganizationsViewModel({ activeOnly = false } = {}) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['iam', 'organizations', activeOnly ? 'active' : 'all'],
    queryFn: () => (activeOnly ? organizationService.active() : organizationService.list()),
  });

  const create = useMutation({
    mutationFn: (payload) => organizationService.create(payload),
    onSuccess: () => {
      toast.success('Organization created');
      qc.invalidateQueries({ queryKey: ['iam', 'organizations'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => organizationService.update(id, payload),
    onSuccess: () => {
      toast.success('Organization updated');
      qc.invalidateQueries({ queryKey: ['iam', 'organizations'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => organizationService.remove(id),
    onSuccess: () => {
      toast.success('Organization deleted');
      qc.invalidateQueries({ queryKey: ['iam', 'organizations'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, update, remove };
}
