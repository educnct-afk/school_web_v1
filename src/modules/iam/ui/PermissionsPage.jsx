import { useMemo, useState } from 'react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { usePermissionsViewModel } from '../viewmodels/usePermissionsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function PermissionsPage() {
  const { list, create, remove } = usePermissionsViewModel();
  const authPerms = useAuthStore((s) => s.permissions);

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Permissions"
          subtitle="Atomic capabilities in the format module:resource:action."
          actions={
            canCreate ? (
              <Button onClick={() => setOpenCreate(true)}>
                <Plus size={16} /> New permission
              </Button>
            ) : null
          }
        />

        <div className="mb-4 max-w-sm">
          <Input placeholder="Filter by module, resource, or description…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>

        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
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
                      <Button variant="ghost" className="!p-2" aria-label="Delete" onClick={() => {
                        if (confirm(`Delete permission ${p.module}:${p.resource}:${p.action}?`)) remove.mutate(p.id);
                      }}>
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
  const [form, setForm] = useState({ module: '', resource: '', action: '', description: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create permission"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} loading={loading}>Create</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
        <div className="grid grid-cols-3 gap-2">
          <Input label="Module" required value={form.module} onChange={set('module')} />
          <Input label="Resource" required value={form.resource} onChange={set('resource')} />
          <Input label="Action" required value={form.action} onChange={set('action')} />
        </div>
        <Input label="Description" value={form.description} onChange={set('description')} />
      </form>
    </Modal>
  );
}
