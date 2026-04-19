import { useMemo, useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Trash2, Shield } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import Avatar from '@core/ui/Avatar';
import { useUsersViewModel } from '../viewmodels/useUsersViewModel';
import { useRolesViewModel } from '../viewmodels/useRolesViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function UsersPage() {
  const { list, create, changeRole, remove } = useUsersViewModel();
  const { list: rolesList } = useRolesViewModel();
  const permissions = useAuthStore((s) => s.permissions);

  const [openCreate, setOpenCreate] = useState(false);
  const [openRole, setOpenRole] = useState(null); // user row

  const canCreate = hasPermission(permissions, 'iam:users:create');
  const canDelete = hasPermission(permissions, 'iam:users:delete');
  const canUpdate = hasPermission(permissions, 'iam:users:update');

  const rows = list.data ?? [];
  const rolesById = useMemo(() => {
    const map = {};
    (rolesList.data ?? []).forEach((r) => (map[r.id] = r));
    return map;
  }, [rolesList.data]);

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

        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
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
                render: (r) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={r.fullName || r.email} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.fullName || '—'}</p>
                      <p className="text-xs text-ink-500 truncate">{r.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role', header: 'Role',
                render: (r) => <Badge tone="brand">{r.roleDisplayName || rolesById[r.roleId]?.displayName || '—'}</Badge>,
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
                      <Button variant="ghost" className="!p-2" aria-label="Delete" onClick={() => {
                        if (confirm(`Delete ${r.email}?`)) remove.mutate(r.id);
                      }}>
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
  const [form, setForm] = useState({ email: '', fullName: '', password: '', roleId: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create user"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading}>Create</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Input label="Full name" value={form.fullName} onChange={set('fullName')} />
        <Input label="Temporary password" type="password" required value={form.password} onChange={set('password')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Role</span>
          <select className="input" required value={form.roleId} onChange={set('roleId')}>
            <option value="">Select a role…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName}</option>)}
          </select>
        </label>
      </form>
    </Modal>
  );
}

function ChangeRoleModal({ user, roles, onClose, onSubmit, loading }) {
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    if (user) setRoleId(user.roleId ?? '');
  }, [user]);
  if (!user) return null;

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={`Change role · ${user.email}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(roleId)} loading={loading} disabled={!roleId || roleId === user.roleId}>Save</Button>
        </>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Role</span>
        <select className="input" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
          <option value="">Select…</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName}</option>)}
        </select>
      </label>
    </Modal>
  );
}
