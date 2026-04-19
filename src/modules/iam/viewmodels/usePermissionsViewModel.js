import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { permissionService } from '../services/iamService';

export function usePermissionsViewModel(moduleName) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: moduleName ? ['iam', 'permissions', 'module', moduleName] : ['iam', 'permissions'],
    queryFn: () => (moduleName ? permissionService.byModule(moduleName) : permissionService.list()),
  });

  const create = useMutation({
    mutationFn: (payload) => permissionService.create(payload),
    onSuccess: () => {
      toast.success('Permission created');
      qc.invalidateQueries({ queryKey: ['iam', 'permissions'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => permissionService.remove(id),
    onSuccess: () => {
      toast.success('Permission deleted');
      qc.invalidateQueries({ queryKey: ['iam', 'permissions'] });
    },
    onError: (e) => toast.error(e.message),
  });

  return { list, create, remove };
}
