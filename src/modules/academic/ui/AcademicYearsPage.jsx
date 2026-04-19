import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { useState } from 'react';
import { useAcademicYearsViewModel } from '../viewmodels/useAcademicYearsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function AcademicYearsPage() {
  const { list, create, remove } = useAcademicYearsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);

  const canCreate = hasPermission(permissions, 'academic:academic-years:create');
  const canDelete = hasPermission(permissions, 'academic:academic-years:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Academic Years"
          subtitle="Academic years for this organization."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add year</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={CalendarDays} title="No academic years yet"
            description="Create your first academic year to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add year</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            {
              key: 'name', header: 'Year',
              render: (r) => (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  {r.isCurrent && <Badge tone="success">Current</Badge>}
                </div>
              ),
            },
            { key: 'start', header: 'Start', render: (r) => r.startDate ?? '—' },
            { key: 'end', header: 'End', render: (r) => r.endDate ?? '—' },
            {
              key: 'actions', header: '',
              render: (r) => canDelete ? (
                <div className="flex justify-end">
                  <Button variant="ghost" className="!p-2" onClick={() => { if (confirm(`Delete ${r.name}?`)) remove.mutate(r.id); }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ) : null,
            },
          ]} />
        )}
      </Card>

      <CreateAcademicYearModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />
    </div>
  );
}

function CreateAcademicYearModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Create academic year"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <Input label="Name" required value={form.name} onChange={set('name')} placeholder="e.g. 2025-2026" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" required value={form.startDate} onChange={set('startDate')} />
          <Input label="End date" type="date" required value={form.endDate} onChange={set('endDate')} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isCurrent}
            onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked }))} />
          Set as current academic year
        </label>
      </form>
    </Modal>
  );
}
