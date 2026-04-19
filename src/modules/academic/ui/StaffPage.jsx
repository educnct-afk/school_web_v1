import { Users, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Avatar from '@core/ui/Avatar';
import Badge from '@core/ui/Badge';
import { useState } from 'react';
import { useStaffViewModel } from '../viewmodels/useStaffViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function StaffPage() {
  const { list, create, remove } = useStaffViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);

  const canCreate = hasPermission(permissions, 'academic:staff:create');
  const canDelete = hasPermission(permissions, 'academic:staff:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Staff"
          subtitle="Teachers, administrators, and other staff members."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add staff</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={Users} title="No staff yet"
            description="Add the first staff member to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add staff</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.userId} rows={rows} columns={[
            {
              key: 'who', header: 'Staff member',
              render: (r) => (
                <div className="flex items-center gap-3">
                  <Avatar name={`${r.user?.firstName} ${r.user?.lastName}`} />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.user?.firstName} {r.user?.lastName}</p>
                    <p className="text-xs text-ink-500 truncate">{r.user?.email}</p>
                  </div>
                </div>
              ),
            },
            { key: 'dept', header: 'Department', render: (r) => r.department?.name ?? <span className="text-ink-400">—</span> },
            { key: 'role', header: 'Role', render: (r) => <Badge tone="brand">{r.user?.role?.displayName ?? '—'}</Badge> },
            {
              key: 'actions', header: '',
              render: (r) => canDelete ? (
                <div className="flex justify-end">
                  <Button variant="ghost" className="!p-2" onClick={() => { if (confirm(`Delete ${r.user?.email}?`)) remove.mutate(r.userId); }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ) : null,
            },
          ]} />
        )}
      </Card>

      <CreateStaffModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />
    </div>
  );
}

function CreateStaffModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', password: '',
    roleId: '', employmentDate: '', departmentId: '', qualification: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Add staff member"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" required value={form.firstName} onChange={set('firstName')} />
          <Input label="Last name" required value={form.lastName} onChange={set('lastName')} />
        </div>
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Input label="Temporary password" type="password" required value={form.password} onChange={set('password')} />
        <Input label="Role ID" required value={form.roleId} onChange={set('roleId')} />
        <Input label="Employment date" type="date" required value={form.employmentDate} onChange={set('employmentDate')} />
        <Input label="Department ID (optional)" value={form.departmentId} onChange={set('departmentId')} />
        <Input label="Qualification (optional)" value={form.qualification} onChange={set('qualification')} />
      </form>
    </Modal>
  );
}
