import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { useState } from 'react';
import { useClassGroupsViewModel } from '../viewmodels/useClassGroupsViewModel';
import { useAcademicYearsViewModel } from '../viewmodels/useAcademicYearsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function ClassGroupsPage() {
  const { list, create, remove } = useClassGroupsViewModel();
  const { list: yearsList } = useAcademicYearsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);

  const canCreate = hasPermission(permissions, 'academic:class-groups:create');
  const canDelete = hasPermission(permissions, 'academic:class-groups:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Class Groups"
          subtitle="Classes and sections for each academic year."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add class</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={LayoutGrid} title="No class groups yet"
            description="Create your first class group to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add class</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
            { key: 'grade', header: 'Grade', render: (r) => r.gradeLevel ?? '—' },
            { key: 'section', header: 'Section', render: (r) => r.section ? <Badge tone="neutral">{r.section}</Badge> : '—' },
            { key: 'year', header: 'Academic Year', render: (r) => r.academicYear?.name ?? '—' },
            { key: 'capacity', header: 'Capacity', render: (r) => r.capacity ?? '—' },
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

      <CreateClassGroupModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
        academicYears={yearsList.data ?? []}
      />
    </div>
  );
}

function CreateClassGroupModal({ open, onClose, onSubmit, loading, academicYears }) {
  const [form, setForm] = useState({ academicYearId: '', gradeLevel: '', section: '', capacity: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    const parts = [form.gradeLevel && `Grade ${form.gradeLevel}`, form.section && `Section ${form.section}`].filter(Boolean);
    onSubmit({ ...form, name: parts.join(' - ') });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create class group"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Academic year <span className="text-red-500">*</span></span>
          <select className="input" required value={form.academicYearId} onChange={set('academicYearId')}>
            <option value="">Select academic year…</option>
            {academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Grade level" value={form.gradeLevel} onChange={set('gradeLevel')} placeholder="e.g. 5" />
          <Input label="Section" value={form.section} onChange={set('section')} placeholder="e.g. A" />
        </div>
        <Input label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} />
      </form>
    </Modal>
  );
}
