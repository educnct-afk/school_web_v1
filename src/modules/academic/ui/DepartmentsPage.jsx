import { Building, Plus, Trash2, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import { useState } from 'react';
import { useDepartmentsViewModel } from '../viewmodels/useDepartmentsViewModel';
import { useStaffViewModel } from '../viewmodels/useStaffViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function DepartmentsPage() {
  const { list, create, update, remove } = useDepartmentsViewModel();
  const { list: staffList } = useStaffViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const canCreate = hasPermission(permissions, 'academic:departments:create');
  const canDelete = hasPermission(permissions, 'academic:departments:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Departments"
          subtitle="Academic departments within this organization."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add department</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={Building} title="No departments yet"
            description="Create your first department to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add department</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
            {
              key: 'head', header: 'Head',
              render: (r) => r.headOfDepartment
                ? `${r.headOfDepartment.firstName} ${r.headOfDepartment.lastName}`
                : <span className="text-ink-400">Unassigned</span>,
            },
            {
              key: 'actions', header: '',
              render: (r) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" className="!p-2" onClick={() => setEditing(r)}>
                    <Pencil size={16} />
                  </Button>
                  {canDelete && (
                    <Button variant="ghost" className="!p-2" onClick={() => { if (confirm(`Delete ${r.name}?`)) remove.mutate(r.id); }}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ),
            },
          ]} />
        )}
      </Card>

      <CreateDepartmentModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
        staff={staffList.data ?? []}
      />
      <EditDepartmentModal
        department={editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
        staff={staffList.data ?? []}
      />
    </div>
  );
}

function EditDepartmentModal({ department, onClose, onSubmit, loading, staff }) {
  const [form, setForm] = useState({ name: '', headUserId: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const prevDept = useState(null);
  if (department && prevDept[0] !== department) {
    prevDept[1](department);
    form.name = department.name ?? '';
    form.headUserId = department.headOfDepartment?.id ?? '';
  }

  return (
    <Modal open={!!department} onClose={onClose} title={`Edit ${department?.name ?? 'department'}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Save</Button></>}
    >
      <form className="space-y-4">
        <Input label="Name" required value={form.name} onChange={set('name')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Head of department (optional)</span>
          <select className="input" value={form.headUserId} onChange={set('headUserId')}>
            <option value="">None</option>
            {staff.map((s) => (
              <option key={s.userId} value={s.userId}>
                {s.user?.firstName} {s.user?.lastName}
              </option>
            ))}
          </select>
        </label>
      </form>
    </Modal>
  );
}

function CreateDepartmentModal({ open, onClose, onSubmit, loading, staff }) {
  const [form, setForm] = useState({ name: '', headUserId: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Create department"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <Input label="Name" required value={form.name} onChange={set('name')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Head of department (optional)</span>
          <select className="input" value={form.headUserId} onChange={set('headUserId')}>
            <option value="">None</option>
            {staff.map((s) => (
              <option key={s.userId} value={s.userId}>
                {s.user?.firstName} {s.user?.lastName}
              </option>
            ))}
          </select>
        </label>
      </form>
    </Modal>
  );
}
