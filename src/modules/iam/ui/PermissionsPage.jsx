import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { Skeleton } from '@core/ui/Skeleton';
import { useConfirm } from '@core/ui/ConfirmDialog';
import { usePermissionsViewModel } from '../viewmodels/usePermissionsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';
import { MODULES, ACTIONS, getResources } from '@core/auth/permissionCatalog';

export default function PermissionsPage() {
  const { list, create, remove } = usePermissionsViewModel();
  const authPerms = useAuthStore((s) => s.permissions);
  const confirm = useConfirm();

  const [openCreate, setOpenCreate] = useState(false);
  const [filter, setFilter] = useState('');

  const canCreate = hasPermission(authPerms, 'iam:permissions:create');
  const canDelete = hasPermission(authPerms, 'iam:permissions:delete');

  const grouped = useMemo(() => {
    const all = list.data ?? [];
    const byModule = {};
    const q = filter.trim().toLowerCase();
    all.forEach((p) => {
      const key = `${p.module}:${p.resource}:${p.action}`;
      if (q && !key.toLowerCase().includes(q) && !(p.description ?? '').toLowerCase().includes(q)) return;
      (byModule[p.module] ||= []).push(p);
    });
    return byModule;
  }, [list.data, filter]);

  const modules = Object.keys(grouped).sort();

  async function handleDelete(p) {
    const ok = await confirm({
      title: 'Delete permission?',
      description: `"${p.module}:${p.resource}:${p.action}" will be removed from all roles.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (ok) remove.mutate(p.id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Permissions"
          subtitle="Atomic capabilities in the format module:resource:action."
          actions={
            canCreate ? (
              <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> New permission</Button>
            ) : null
          }
        />

        <div className="mb-4 max-w-sm">
          <Input placeholder="Filter by module, resource, or description…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>

        {list.isLoading && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="card p-3 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        )}

        {list.data && modules.length === 0 && (
          <EmptyState icon={KeyRound} title="No permissions" description="No permissions match your filter." />
        )}

        <div className="space-y-5">
          {modules.map((mod) => (
            <section key={mod}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500 mb-2">{mod}</h3>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[mod].map((p) => (
                  <li key={p.id} className="card p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.resource}:{p.action}</p>
                      <p className="text-xs text-ink-500 truncate">{p.description || `${p.module}:${p.resource}:${p.action}`}</p>
                      {p.isSystemPermission && <Badge tone="warn" className="mt-2">System</Badge>}
                    </div>
                    {canDelete && !p.isSystemPermission && (
                      <Button variant="ghost" className="!p-2" aria-label="Delete" onClick={() => handleDelete(p)}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Card>

      <CreatePermissionModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />
    </div>
  );
}

function CreatePermissionModal({ open, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { module: '', resource: '', action: '', description: '' },
  });

  const selectedModule = watch('module');
  const resources = useMemo(() => getResources(selectedModule), [selectedModule]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    setValue('resource', '');
  }, [selectedModule, setValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create permission"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={loading}>Create</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectField
            label="Module"
            error={errors.module?.message}
            {...register('module', { required: 'Required' })}
          >
            <option value="">Select…</option>
            {MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </SelectField>

          <SelectField
            label="Resource"
            disabled={!selectedModule}
            error={errors.resource?.message}
            {...register('resource', { required: 'Required' })}
          >
            <option value="">{selectedModule ? 'Select…' : 'Pick a module first'}</option>
            {resources.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </SelectField>

          <SelectField
            label="Action"
            error={errors.action?.message}
            {...register('action', { required: 'Required' })}
          >
            <option value="">Select…</option>
            {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </SelectField>
        </div>
        <Input label="Description" {...register('description')} />
      </form>
    </Modal>
  );
}

const SelectField = forwardRef(function SelectField({ label, error, children, disabled, ...rest }, ref) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select
        ref={ref}
        disabled={disabled}
        className={`input ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1.5 block text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
});
