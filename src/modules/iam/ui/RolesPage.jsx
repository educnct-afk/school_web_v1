import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, KeyRound, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { useRolesViewModel, useRolePermissionsViewModel } from '../viewmodels/useRolesViewModel';
import { usePermissionsViewModel } from '../viewmodels/usePermissionsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function RolesPage() {
  const { list, create, update, remove } = useRolesViewModel();
  const permissions = useAuthStore((s) => s.permissions);

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [managing, setManaging] = useState(null);

  const canCreate = hasPermission(permissions, 'iam:roles:create');
  const canUpdate = hasPermission(permissions, 'iam:roles:update');
  const canDelete = hasPermission(permissions, 'iam:roles:delete');

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Roles"
          subtitle="Collections of permissions assignable to users."
          actions={
            canCreate ? (
              <Button onClick={() => setOpenCreate(true)}>
                <Plus size={16} /> New role
              </Button>
            ) : null
          }
        />

        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={ShieldCheck} title="No roles" description="Create your first role to control access." />
        )}

        {rows.length > 0 && (
          <DataTable
            keyOf={(r) => r.id}
            rows={rows}
            columns={[
              {
                key: 'name', header: 'Role',
                render: (r) => (
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.displayName}</p>
                    <p className="text-xs text-ink-500 truncate">{r.slug}</p>
                  </div>
                ),
              },
              {
                key: 'system', header: 'Type',
                render: (r) => <Badge tone={r.isSystemRole ? 'warn' : 'neutral'}>{r.isSystemRole ? 'System' : 'Custom'}</Badge>,
              },
              { key: 'desc', header: 'Description', render: (r) => r.description || '—' },
              {
                key: 'actions', header: '',
                render: (r) => (
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" className="!p-2" aria-label="Manage permissions" onClick={() => setManaging(r)}>
                      <KeyRound size={16} />
                    </Button>
                    {canUpdate && !r.isSystemRole && (
                      <Button variant="ghost" className="!p-2" aria-label="Edit" onClick={() => setEditing(r)}>
                        <Pencil size={16} />
                      </Button>
                    )}
                    {canDelete && !r.isSystemRole && (
                      <Button variant="ghost" className="!p-2" aria-label="Delete" onClick={() => {
                        if (confirm(`Delete role ${r.displayName}?`)) remove.mutate(r.id);
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

      <RoleFormModal
        open={openCreate}
        title="Create role"
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />

      <RoleFormModal
        open={!!editing}
        title="Edit role"
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
      />

      {managing && (
        <ManagePermissionsModal role={managing} onClose={() => setManaging(null)} />
      )}
    </div>
  );
}

function RoleFormModal({ open, title, initial, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    slug: '', displayName: '', description: '', icon: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) {
      setForm({
        slug: initial?.slug ?? '',
        displayName: initial?.displayName ?? '',
        description: initial?.description ?? '',
        icon: initial?.icon ?? '',
      });
    }
  }, [open, initial]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading}>Save</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Slug" required value={form.slug} onChange={set('slug')} hint="Lowercase identifier, e.g. teacher" />
        <Input label="Display name" required value={form.displayName} onChange={set('displayName')} />
        <Input label="Icon" value={form.icon} onChange={set('icon')} hint="Lucide icon name for UI" />
        <Input label="Description" value={form.description} onChange={set('description')} />
      </form>
    </Modal>
  );
}

function ManagePermissionsModal({ role, onClose }) {
  const { list: roleList, grant, revoke } = useRolePermissionsViewModel(role.id);
  const { list: allList } = usePermissionsViewModel();
  const authPerms = useAuthStore((s) => s.permissions);
  const canGrant = hasPermission(authPerms, 'iam:roles:update');

  const grantedIds = new Set((roleList.data ?? []).map((p) => p.id));

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Permissions · ${role.displayName}`}
      footer={<Button variant="outline" onClick={onClose}>Done</Button>}
    >
      {(roleList.isLoading || allList.isLoading) && <p className="text-sm text-ink-500">Loading…</p>}
      {allList.data && (
        <ul className="divide-y divide-ink-100 dark:divide-white/5">
          {allList.data.map((p) => {
            const on = grantedIds.has(p.id);
            return (
              <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.module}:{p.resource}:{p.action}</p>
                  {p.description && <p className="text-xs text-ink-500 truncate">{p.description}</p>}
                </div>
                {canGrant && (
                  <Button
                    variant={on ? 'outline' : 'primary'}
                    onClick={() => (on ? revoke.mutate(p.id) : grant.mutate(p.id))}
                    loading={on ? revoke.isPending : grant.isPending}
                  >
                    {on ? 'Revoke' : 'Grant'}
                  </Button>
                )}
                {!canGrant && <Badge tone={on ? 'success' : 'neutral'}>{on ? 'Granted' : '—'}</Badge>}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
