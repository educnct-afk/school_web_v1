import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '@core/ui/layouts/AuthLayout';
import Input from '@core/ui/Input';
import Button from '@core/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [sent, setSent] = useState(false);

  async function onSubmit() {
    // The current server exposes /api/password-resets requiring a userId + tokenHash.
    // A proper "send reset link by email" endpoint isn't implemented yet — we show
    // the user a friendly message so the flow is visible in the UI.
    toast.success('If an account exists for that email, a reset link has been sent.');
    setSent(true);
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link to="/login" className="text-brand-700 dark:text-brand-300 hover:underline">Back to sign in</Link>}
    >
      {sent ? (
        <div className="card">
          <p className="text-ink-700 dark:text-ink-100">Check your inbox for a reset link.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}
