import { BookOpen, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import { useState } from 'react';
import { useSubjectsViewModel } from '../viewmodels/useSubjectsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function SubjectsPage() {
  const { list, create, remove } = useSubjectsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);

  const canCreate = hasPermission(permissions, 'academic:subjects:create');
  const canDelete = hasPermission(permissions, 'academic:subjects:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Subjects"
          subtitle="Subjects offered by this organization."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add subject</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={BookOpen} title="No subjects yet"
            description="Add your first subject to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add subject</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
            { key: 'code', header: 'Code', render: (r) => r.code ?? '—' },
            { key: 'dept', header: 'Department', render: (r) => r.department?.name ?? '—' },
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

      <CreateSubjectModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />
    </div>
  );
}

function CreateSubjectModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', code: '', description: '', departmentId: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Add subject"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <Input label="Name" required value={form.name} onChange={set('name')} />
        <Input label="Code" value={form.code} onChange={set('code')} placeholder="e.g. MATH101" />
        <Input label="Description" value={form.description} onChange={set('description')} />
        <Input label="Department ID (optional)" value={form.departmentId} onChange={set('departmentId')} />
      </form>
    </Modal>
  );
}
