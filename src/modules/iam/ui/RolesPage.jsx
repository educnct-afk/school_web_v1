import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck, Plus, Trash2, KeyRound, Pencil,
  GraduationCap, UserCheck, Users, ChevronRight, Sparkles, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { roleService } from '../services/iamService';
import clsx from 'clsx';
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

// Modules render in this order; anything not listed sorts after, alphabetically.
const MODULE_ORDER = ['iam', 'auth', 'academic', 'schedule', 'exams', 'studies'];
// Actions render in this order within a resource (read first, destructive last).
const ACTION_ORDER = ['read', 'create', 'update', 'delete'];

const MODULE_LABEL = {
  iam: 'Identity & Access',
  auth: 'Authentication',
  academic: 'Academic',
  schedule: 'Schedule',
  exams: 'Exams',
  studies: 'Studies',
};

function ManagePermissionsModal({ role, onClose }) {
  const { list: roleList } = useRolePermissionsViewModel(role.id);
  const { list: allList } = usePermissionsViewModel();
  const authPerms = useAuthStore((s) => s.permissions);
  const canGrant = hasPermission(authPerms, 'iam:roles:update');
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());

  // roleList.data returns List<RolePermission> — the join-row id, not the permission id.
  // Pull the inner permission.id so it matches what the catalog renders.
  const grantedIds = useMemo(
    () => new Set((roleList.data ?? []).map((rp) => rp.permission?.id).filter(Boolean)),
    [roleList.data],
  );

  const queryKey = ['iam', 'roles', role.id, 'permissions'];

  // Pure optimistic toggle. Updates the cache synchronously, fires the request,
  // rolls back on error. No pending spinner needed — the pill flips instantly
  // and stays in its new state because the cache itself is the source of truth.
  async function handleGrant(perm) {
    await qc.cancelQueries({ queryKey });
    const prev = qc.getQueryData(queryKey);
    qc.setQueryData(queryKey, (old = []) => {
      if ((old ?? []).some((rp) => rp.permission?.id === perm.id)) return old;
      return [...(old ?? []), { id: `__opt_${perm.id}`, permission: perm }];
    });
    try {
      await roleService.grant(role.id, perm.id);
      // Background sync replaces our optimistic temp-id row with the real one.
      qc.invalidateQueries({ queryKey });
    } catch (err) {
      qc.setQueryData(queryKey, prev);
      toast.error(err.message ?? 'Failed to grant');
    }
  }

  async function handleRevoke(perm) {
    await qc.cancelQueries({ queryKey });
    const prev = qc.getQueryData(queryKey);
    qc.setQueryData(queryKey, (old = []) =>
      (old ?? []).filter((rp) => rp.permission?.id !== perm.id),
    );
    try {
      await roleService.revoke(role.id, perm.id);
      qc.invalidateQueries({ queryKey });
    } catch (err) {
      qc.setQueryData(queryKey, prev);
      toast.error(err.message ?? 'Failed to revoke');
    }
  }

  const wildcard = (allList.data ?? []).find(
    (p) => p.module === '*' && p.resource === '*' && p.action === '*',
  );

  const groups = useMemo(
    () => groupPermissions(allList.data ?? [], search),
    [allList.data, search],
  );

  function toggleCollapsed(moduleName) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) next.delete(moduleName);
      else next.add(moduleName);
      return next;
    });
  }

  function bulkGrant(perms) {
    perms.forEach((p) => { if (!grantedIds.has(p.id)) handleGrant(p); });
  }

  function bulkRevoke(perms) {
    perms.forEach((p) => { if (grantedIds.has(p.id)) handleRevoke(p); });
  }

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
            <div key={i} className="skeleton h-12 w-full rounded-lg" />
          ))}
        </div>
      )}

      {allList.data && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              className="input pl-8"
              placeholder="Search by module, resource, action, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {wildcard && search.trim() === '' && (
            <WildcardRow
              perm={wildcard}
              granted={grantedIds.has(wildcard.id)}
              canGrant={canGrant}
              onToggle={() => (grantedIds.has(wildcard.id) ? handleRevoke(wildcard) : handleGrant(wildcard))}
            />
          )}

          {groups.length === 0 && (
            <p className="text-sm text-ink-500 py-6 text-center">No permissions match "{search}".</p>
          )}

          <div className="space-y-2">
            {groups.map((group) => (
              <ModuleGroup
                key={group.module}
                group={group}
                collapsed={collapsed.has(group.module)}
                onToggle={() => toggleCollapsed(group.module)}
                grantedIds={grantedIds}
                canGrant={canGrant}
                onGrant={handleGrant}
                onRevoke={handleRevoke}
                onBulkGrant={bulkGrant}
                onBulkRevoke={bulkRevoke}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function WildcardRow({ perm, granted, canGrant, onToggle }) {
  return (
    <div className={clsx(
      'flex items-center gap-3 px-4 py-3 rounded-lg border',
      granted
        ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700'
        : 'border-ink-200 dark:border-ink-700',
    )}>
      <Sparkles size={16} className={granted ? 'text-amber-700 dark:text-amber-300' : 'text-ink-400'} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">Wildcard · *:*:*</p>
        <p className="text-xs text-ink-500 truncate">
          {perm.description ?? 'Grants every permission. Reserve for super admin.'}
        </p>
      </div>
      {canGrant && (
        <Button variant={granted ? 'outline' : 'primary'} onClick={onToggle}>
          {granted ? 'Revoke' : 'Grant'}
        </Button>
      )}
    </div>
  );
}

function ModuleGroup({
  group, collapsed, onToggle, grantedIds,
  canGrant, onGrant, onRevoke, onBulkGrant, onBulkRevoke,
}) {
  // grantedIds already reflects optimistic state via the cache update, so the
  // X/Y badge updates the instant a pill is clicked.
  const grantedCount = group.perms.filter((p) => grantedIds.has(p.id)).length;
  const totalCount = group.perms.length;
  const allGranted = grantedCount === totalCount;
  const noneGranted = grantedCount === 0;

  return (
    <div className="border border-ink-200 dark:border-ink-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-ink-50 dark:bg-ink-800/40">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          aria-expanded={!collapsed}
        >
          <ChevronRight
            size={16}
            className={clsx('transition-transform shrink-0', !collapsed && 'rotate-90')}
          />
          <span className="font-medium text-sm capitalize">
            {MODULE_LABEL[group.module] ?? group.module}
          </span>
          <Badge tone={grantedCount > 0 ? 'brand' : 'neutral'}>
            {grantedCount}/{totalCount}
          </Badge>
        </button>
        {canGrant && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={allGranted}
              onClick={() => onBulkGrant(group.perms)}
              className="text-xs px-2 py-1 rounded text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Grant all
            </button>
            <button
              type="button"
              disabled={noneGranted}
              onClick={() => onBulkRevoke(group.perms)}
              className="text-xs px-2 py-1 rounded text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Revoke all
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {group.resources.map((resource) => (
            <ResourceRow
              key={resource.name}
              resource={resource}
              grantedIds={grantedIds}
              canGrant={canGrant}
              onGrant={onGrant}
              onRevoke={onRevoke}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceRow({ resource, grantedIds, canGrant, onGrant, onRevoke }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-sm capitalize">{resource.name.replace(/-/g, ' ')}</p>
        <p className="text-xs text-ink-500 truncate">{resource.name}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 justify-end">
        {resource.actions.map((perm) => {
          const on = grantedIds.has(perm.id);
          return (
            <button
              key={perm.id}
              type="button"
              role="switch"
              aria-checked={on}
              disabled={!canGrant}
              onClick={() => (on ? onRevoke(perm) : onGrant(perm))}
              title={perm.description ?? `${perm.module}:${perm.resource}:${perm.action}`}
              className={clsx(
                'inline-flex items-center gap-1.5 pl-2 pr-3 py-1 text-xs rounded-full font-medium transition border',
                on
                  // Active pill: solid green. Light mode hover darkens; dark mode hover
                  // BRIGHTENS so text stays high-contrast against the bg.
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 dark:bg-emerald-500 dark:border-emerald-500 dark:hover:bg-emerald-400 dark:hover:border-emerald-400'
                  // Inactive pill: outline only, muted — clearly "OFF".
                  : 'bg-transparent text-ink-500 border-ink-300 dark:border-ink-700 hover:border-ink-500 dark:hover:border-ink-500 hover:text-ink-700 dark:hover:text-ink-200',
                canGrant ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed',
              )}
            >
              <span
                className={clsx(
                  'w-1.5 h-1.5 rounded-full',
                  on ? 'bg-white' : 'bg-ink-300 dark:bg-ink-600',
                )}
                aria-hidden
              />
              {perm.action}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function moduleSortKey(module) {
  const idx = MODULE_ORDER.indexOf(module);
  return idx === -1 ? `z:${module}` : String(idx).padStart(3, '0');
}

function actionSortKey(action) {
  const idx = ACTION_ORDER.indexOf(action);
  return idx === -1 ? `z:${action}` : String(idx).padStart(3, '0');
}

function matchesSearch(perm, q) {
  if (!q) return true;
  const slug = `${perm.module}:${perm.resource}:${perm.action}`.toLowerCase();
  if (slug.includes(q)) return true;
  return (perm.description ?? '').toLowerCase().includes(q);
}

function groupPermissions(perms, search) {
  const q = search.trim().toLowerCase();
  // The wildcard is rendered separately as a banner.
  const filtered = perms.filter((p) => {
    if (p.module === '*' && p.resource === '*' && p.action === '*') return false;
    return matchesSearch(p, q);
  });

  const byModule = new Map();
  for (const p of filtered) {
    if (!byModule.has(p.module)) byModule.set(p.module, []);
    byModule.get(p.module).push(p);
  }

  const groups = [];
  for (const [module, modulePerms] of byModule) {
    const byResource = new Map();
    for (const p of modulePerms) {
      if (!byResource.has(p.resource)) byResource.set(p.resource, []);
      byResource.get(p.resource).push(p);
    }
    const resources = [];
    for (const [name, actions] of byResource) {
      actions.sort((a, b) => actionSortKey(a.action).localeCompare(actionSortKey(b.action)));
      resources.push({ name, actions });
    }
    resources.sort((a, b) => a.name.localeCompare(b.name));
    groups.push({ module, perms: modulePerms, resources });
  }
  groups.sort((a, b) => moduleSortKey(a.module).localeCompare(moduleSortKey(b.module)));
  return groups;
}
