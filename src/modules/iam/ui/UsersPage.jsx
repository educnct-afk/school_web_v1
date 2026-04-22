import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Users as UsersIcon, Plus, Trash2, Shield } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import Avatar from '@core/ui/Avatar';
import { SkeletonTable } from '@core/ui/Skeleton';
import { useConfirm } from '@core/ui/ConfirmDialog';
import { useUsersViewModel } from '../viewmodels/useUsersViewModel';
import { useRolesViewModel } from '../viewmodels/useRolesViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function UsersPage() {
  const { list, create, changeRole, remove } = useUsersViewModel();
  const { list: rolesList } = useRolesViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const confirm = useConfirm();

  const [openCreate, setOpenCreate] = useState(false);
  const [openRole, setOpenRole] = useState(null);

  const canCreate = hasPermission(permissions, 'iam:users:create');
  const canDelete = hasPermission(permissions, 'iam:users:delete');
  const canUpdate = hasPermission(permissions, 'iam:users:update');

  const rows = list.data ?? [];

  async function handleDelete(row) {
    const ok = await confirm({
      title: 'Delete user?',
      description: `${row.email} will lose access immediately. This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (ok) remove.mutate(row.id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Users"
          subtitle="People in this organization."
          actions={
            canCreate ? (
              <Button onClick={() => setOpenCreate(true)}>
                <Plus size={16} /> Add user
              </Button>
            ) : null
          }
        />

        {list.isLoading && <SkeletonTable rows={5} cols={3} />}

        {list.data && rows.length === 0 && (
          <EmptyState
            icon={UsersIcon}
            title="No users yet"
            description="Invite your first user to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add user</Button> : null}
          />
        )}

        {rows.length > 0 && (
          <DataTable
            keyOf={(r) => r.id}
            rows={rows}
            columns={[
              {
                key: 'who', header: 'User',
                render: (r) => {
                  const name = [r.firstName, r.lastName].filter(Boolean).join(' ');
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar name={name || r.email} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{name || '—'}</p>
                        <p className="text-xs text-ink-500 truncate">{r.email}</p>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: 'role', header: 'Role',
                render: (r) => <Badge tone="brand">{r.role?.displayName || r.role?.name || '—'}</Badge>,
              },
              {
                key: 'active', header: 'Status',
                render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>,
              },
              {
                key: 'actions', header: '',
                render: (r) => (
                  <div className="flex items-center gap-1 justify-end">
                    {canUpdate && (
                      <Button variant="ghost" className="!p-2" aria-label="Change role" onClick={() => setOpenRole(r)}>
                        <Shield size={16} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" className="!p-2" aria-label="Delete" onClick={() => handleDelete(r)}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        roles={rolesList.data ?? []}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />

      <ChangeRoleModal
        user={openRole}
        roles={rolesList.data ?? []}
        onClose={() => setOpenRole(null)}
        onSubmit={(roleId) => changeRole.mutate({ id: openRole.id, roleId }, { onSuccess: () => setOpenRole(null) })}
        loading={changeRole.isPending}
      />
    </div>
  );
}

function CreateUserModal({ open, onClose, roles, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { email: '', firstName: '', lastName: '', password: '', roleId: '' },
  });

  useEffect(() => { if (!open) reset(); }, [open, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create user"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={loading}>Create</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            error={errors.firstName?.message}
            {...register('firstName', { required: 'First name is required' })}
          />
          <Input
            label="Last name"
            error={errors.lastName?.message}
            {...register('lastName', { required: 'Last name is required' })}
          />
        </div>
        <Input
          label="Temporary password"
          type="password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Role</span>
          <select
            className="input"
            {...register('roleId', { required: 'Pick a role' })}
          >
            <option value="">Select a role…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName || r.name}</option>)}
          </select>
          {errors.roleId && <span className="mt-1.5 block text-xs text-red-600 dark:text-red-400">{errors.roleId.message}</span>}
        </label>
      </form>
    </Modal>
  );
}

function ChangeRoleModal({ user, roles, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { roleId: '' } });

  useEffect(() => {
    if (user) reset({ roleId: user.role?.id ?? '' });
  }, [user, reset]);

  const roleId = watch('roleId');

  if (!user) return null;

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={`Change role · ${user.email}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit((v) => onSubmit(v.roleId))}
            loading={loading}
            disabled={!roleId || roleId === user.role?.id}
          >Save</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit((v) => onSubmit(v.roleId))}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Role</span>
          <select className="input" {...register('roleId')}>
            <option value="">Select…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName || r.name}</option>)}
          </select>
        </label>
      </form>
    </Modal>
  );
}
