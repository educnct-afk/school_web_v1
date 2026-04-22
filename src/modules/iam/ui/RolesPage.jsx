import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Plus, Trash2, KeyRound, Pencil, GraduationCap, UserCheck, Users } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { SkeletonTable } from '@core/ui/Skeleton';
import { useConfirm } from '@core/ui/ConfirmDialog';
import { useRolesViewModel, useRolePermissionsViewModel } from '../viewmodels/useRolesViewModel';
import { usePermissionsViewModel } from '../viewmodels/usePermissionsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';
import { useState } from 'react';

export default function RolesPage() {
  const { list, create, update, remove } = useRolesViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const confirm = useConfirm();

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [managing, setManaging] = useState(null);

  const canCreate = hasPermission(permissions, 'iam:roles:create');
  const canUpdate = hasPermission(permissions, 'iam:roles:update');
  const canDelete = hasPermission(permissions, 'iam:roles:delete');

  const rows = list.data ?? [];

  async function handleDelete(r) {
    const ok = await confirm({
      title: 'Delete role?',
      description: `"${r.displayName}" will be removed. Users assigned this role will lose access.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (ok) remove.mutate(r.id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Roles"
          subtitle="Collections of permissions assignable to users."
          actions={
            canCreate ? (
              <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> New role</Button>
            ) : null
          }
        />

        {list.isLoading && <SkeletonTable rows={4} cols={3} />}
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
                    <p className="font-medium truncate">{r.displayName || r.name}</p>
                    <p className="text-xs text-ink-500 truncate">{r.slug}</p>
                  </div>
                ),
              },
              {
                key: 'archetype', header: 'Archetype',
                render: (r) => r.archetype
                  ? <ArchetypeBadge value={r.archetype} />
                  : <span className="text-xs text-ink-500">—</span>,
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

      <RoleFormModal
        open={openCreate}
        title="Create role"
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />

      <RoleFormModal
        open={!!editing}
        title="Edit role"
        mode="edit"
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate(
          { id: editing.id, payload: { ...editing, ...payload } },
          { onSuccess: () => setEditing(null) },
        )}
        loading={update.isPending}
      />

      {managing && <ManagePermissionsModal role={managing} onClose={() => setManaging(null)} />}
    </div>
  );
}

function RoleFormModal({ open, title, mode, initial, onClose, onSubmit, loading }) {
  const isCreate = mode === 'create';
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', description: '', archetype: '' },
  });

  useEffect(() => {
    if (open) reset({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      archetype: initial?.archetype ?? '',
    });
  }, [open, initial, reset]);

  const submit = (values) => {
    const payload = { name: values.name, description: values.description };
    if (isCreate) payload.archetype = values.archetype;
    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(submit)} loading={loading}>Save</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input
          label="Name"
          hint="e.g. Teacher, Sub-admin. A URL-safe slug is derived automatically."
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        {isCreate && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Archetype</span>
            <select
              className={`input ${errors.archetype ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}`}
              {...register('archetype', { required: 'Pick an archetype' })}
            >
              <option value="">Select…</option>
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
              <option value="GUARDIAN">Guardian</option>
            </select>
            <span className="mt-1.5 block text-xs text-ink-500">
              Which satellite profile this role's users get. Cannot be changed later.
            </span>
            {errors.archetype && <span className="mt-1.5 block text-xs text-red-600 dark:text-red-400">{errors.archetype.message}</span>}
          </label>
        )}
        <Input label="Description" {...register('description')} />
      </form>
    </Modal>
  );
}

const ARCHETYPE_META = {
  STUDENT:  { label: 'Student',  icon: GraduationCap, tone: 'brand' },
  STAFF:    { label: 'Staff',    icon: UserCheck,     tone: 'success' },
  GUARDIAN: { label: 'Guardian', icon: Users,         tone: 'warn' },
};

function ArchetypeBadge({ value }) {
  const meta = ARCHETYPE_META[value];
  if (!meta) return <Badge tone="neutral">{value}</Badge>;
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone}>
      <Icon size={12} className="mr-1" /> {meta.label}
    </Badge>
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
      {(roleList.isLoading || allList.isLoading) && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="space-y-1.5 flex-1 mr-4">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-64" />
              </div>
              <div className="skeleton h-8 w-16 rounded-xl" />
            </div>
          ))}
        </div>
      )}
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
                {canGrant ? (
                  <Button
                    variant={on ? 'outline' : 'primary'}
                    onClick={() => (on ? revoke.mutate(p.id) : grant.mutate(p.id))}
                    loading={on ? revoke.isPending : grant.isPending}
                  >
                    {on ? 'Revoke' : 'Grant'}
                  </Button>
                ) : (
                  <Badge tone={on ? 'success' : 'neutral'}>{on ? 'Granted' : '—'}</Badge>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
