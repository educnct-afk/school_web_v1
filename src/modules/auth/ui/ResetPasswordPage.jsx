import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '@core/ui/layouts/AuthLayout';
import Input from '@core/ui/Input';
import Button from '@core/ui/Button';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const pwd = watch('password');

  async function onSubmit() {
    try {
      await authService.consumePasswordReset({ tokenHash: token });
      toast.success('Password reset successful. You can now sign in.');
    } catch (e) {
      toast.error(e.message || 'Reset failed');
    }
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you'll remember."
      footer={<Link to="/login" className="text-brand-700 dark:text-brand-300 hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
          error={errors.password?.message}
        />
        <Input
          label="Confirm password"
          type="password"
          {...register('confirm', { validate: (v) => v === pwd || 'Passwords do not match' })}
          error={errors.confirm?.message}
        />
        <Button type="submit" className="w-full" disabled={!token}>Reset password</Button>
        {!token && (
          <p className="text-xs text-red-600">Missing reset token in URL.</p>
        )}
      </form>
    </AuthLayout>
  );
}
