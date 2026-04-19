import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuthStore } from '@core/stores/authStore';

export function useLoginViewModel() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      // Server returns LoginResponse { token, user, organization }.
      // Call /me to fetch the full permissions list alongside user/org.
      loginSuccess({ token: data.token, user: data.user, organization: data.organization, permissions: [] });
      try {
        const me = await authService.me();
        loginSuccess({
          token: data.token,
          user: me,
          organization: me?.organization,
          permissions: me?.permissions ?? [],
        });
      } catch {
        /* /me is a nice-to-have enrichment; login still succeeds */
      }
      toast.success('Welcome back!');
      const to = location.state?.from?.pathname || '/';
      navigate(to, { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
