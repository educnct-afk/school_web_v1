import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { useOrganizationsViewModel } from '../viewmodels/useOrganizationsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function OrganizationsPage() {
  const { list, create, update, remove } = useOrganizationsViewModel();
  const permissions = useAuthStore((s) => s.permissions);

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const canCreate = hasPermission(permissions, 'iam:organizations:create');
  const canUpdate = hasPermission(permissions, 'iam:organizations:update');
  const canDelete = hasPermission(permissions, 'iam:organizations:delete');

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Organizations"
          subtitle="Tenants on this platform."
          actions={
            canCreate ? (
              <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> New organization</Button>
            ) : null
          }
        />

        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={Building2} title="No organizations" description="Create the first organization." />
        )}

        {rows.length > 0 && (
          <DataTable
            keyOf={(r) => r.id}
            rows={rows}
            columns={[
              {
                key: 'name', header: 'Organization',
                render: (r) => (
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.name}</p>
                    <p className="text-xs text-ink-500 truncate">{r.slug}</p>
                  </div>
                ),
              },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
              { key: 'email', header: 'Contact', render: (r) => r.contactEmail || '—' },
              {
                key: 'actions', header: '',
                render: (r) => (
                  <div className="flex items-center gap-1 justify-end">
                    {canUpdate && (
                      <Button variant="ghost" className="!p-2" aria-label="Edit" onClick={() => setEditing(r)}>
                        <Pencil size={16} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" className="!p-2" aria-label="Delete" onClick={() => {
                        if (confirm(`Delete organization ${r.name}?`)) remove.mutate(r.id);
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

      <OrgFormModal
        open={openCreate}
        title="Create organization"
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />

      <OrgFormModal
        open={!!editing}
        title="Edit organization"
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
      />
    </div>
  );
}

function OrgFormModal({ open, title, initial, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '', slug: '', contactEmail: '', contactPhone: '', address: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        slug: initial?.slug ?? '',
        contactEmail: initial?.contactEmail ?? '',
        contactPhone: initial?.contactPhone ?? '',
        address: initial?.address ?? '',
      });
    }
  }, [open, initial]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} loading={loading}>Save</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
        <Input label="Name" required value={form.name} onChange={set('name')} />
        <Input label="Slug" required value={form.slug} onChange={set('slug')} />
        <Input label="Contact email" type="email" value={form.contactEmail} onChange={set('contactEmail')} />
        <Input label="Contact phone" value={form.contactPhone} onChange={set('contactPhone')} />
        <Input label="Address" value={form.address} onChange={set('address')} />
      </form>
    </Modal>
  );
}
