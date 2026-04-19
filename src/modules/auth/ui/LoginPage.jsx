import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '@core/ui/layouts/AuthLayout';
import Input from '@core/ui/Input';
import Button from '@core/ui/Button';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { isFeatureEnabled, FEATURES } from '@core/features/featureFlags';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: 'superadmin@system.local', password: 'ChangeMe!2026', organizationId: 'system' },
  });
  const { login, isLoading } = useLoginViewModel();
  const showReset = isFeatureEnabled('AUTH', FEATURES.AUTH.PASSWORD_RESET);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your school workspace."
      footer={
        <>
          Don't have an account? <span className="text-ink-700 dark:text-ink-100">Ask your administrator.</span>
        </>
      }
    >
      <form onSubmit={handleSubmit((v) => login(v))} className="space-y-4">
        <Input
          label="Organization ID"
          placeholder="e.g. system"
          {...register('organizationId', { required: 'Organization ID is required' })}
          error={errors.organizationId?.message}
          hint="Ask your admin if you don't know this."
          autoComplete="organization"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@school.edu"
          {...register('email', { required: 'Email is required' })}
          error={errors.email?.message}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-500">
            <input type="checkbox" className="rounded" /> Remember me
          </label>
          {showReset && (
            <Link to="/forgot-password" className="text-brand-700 dark:text-brand-300 hover:underline">
              Forgot password?
            </Link>
          )}
        </div>

        <Button type="submit" loading={isLoading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
