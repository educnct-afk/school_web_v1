import { useEffect, useState } from 'react';
import Card, { CardHeader } from '@core/ui/Card';
import Input from '@core/ui/Input';
import Button from '@core/ui/Button';
import Avatar from '@core/ui/Avatar';
import Badge from '@core/ui/Badge';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';
import { useAuthStore } from '@core/stores/authStore';

export default function ProfilePage() {
  const { profile, save } = useProfileViewModel();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.user?.role);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', dateOfBirth: '', gender: '', address: '', bio: '', avatarUrl: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (profile.data) {
      setForm({
        firstName: profile.data.firstName ?? '',
        lastName: profile.data.lastName ?? '',
        phone: profile.data.phone ?? '',
        dateOfBirth: profile.data.dateOfBirth ?? '',
        gender: profile.data.gender ?? '',
        address: profile.data.address ?? '',
        bio: profile.data.bio ?? '',
        avatarUrl: profile.data.avatarUrl ?? '',
      });
    }
  }, [profile.data]);

  const submit = (e) => {
    e.preventDefault();
    save.mutate(form);
  };

  const displayName = [form.firstName, form.lastName].filter(Boolean).join(' ') || user?.fullName || user?.email;

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={displayName} src={form.avatarUrl} size="lg" />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">{displayName}</h2>
            <p className="text-sm text-ink-500 truncate">{user?.email}</p>
            {role && <Badge tone="brand" className="mt-2">{role.displayName}</Badge>}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Profile details" subtitle="Personal information visible within your organization." />
        {profile.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={submit}>
          <Input label="First name" value={form.firstName} onChange={set('firstName')} />
          <Input label="Last name" value={form.lastName} onChange={set('lastName')} />
          <Input label="Phone" value={form.phone} onChange={set('phone')} />
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Gender</span>
            <select className="input" value={form.gender} onChange={set('gender')}>
              <option value="">—</option>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <Input label="Avatar URL" value={form.avatarUrl} onChange={set('avatarUrl')} />
          <div className="sm:col-span-2">
            <Input label="Address" value={form.address} onChange={set('address')} />
          </div>
          <div className="sm:col-span-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Bio</span>
              <textarea className="input min-h-[100px]" value={form.bio} onChange={set('bio')} />
            </label>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
