import { Users, Plus, Trash2, Pencil } from 'lucide-react';
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
import { useDepartmentsViewModel } from '../viewmodels/useDepartmentsViewModel';
import { useRolesViewModel } from '../../iam/viewmodels/useRolesViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function StaffPage() {
  const { list, create, update, remove } = useStaffViewModel();
  const { list: departmentsList } = useDepartmentsViewModel();
  const { list: rolesList } = useRolesViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

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
              render: (r) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" className="!p-2" onClick={() => setEditing(r)}>
                    <Pencil size={16} />
                  </Button>
                  {canDelete && (
                    <Button variant="ghost" className="!p-2" onClick={() => { if (confirm(`Delete ${r.user?.email}?`)) remove.mutate(r.userId); }}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ),
            },
          ]} />
        )}
      </Card>

      <CreateStaffModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
        roles={rolesList.data ?? []}
        departments={departmentsList.data ?? []}
      />
      <EditStaffModal
        staff={editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ userId: editing.userId, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
        departments={departmentsList.data ?? []}
      />
    </div>
  );
}

function EditStaffModal({ staff, onClose, onSubmit, loading, departments }) {
  const [form, setForm] = useState({ departmentId: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Reset when a different staff row is opened
  const prevStaff = useState(null);
  if (staff && prevStaff[0] !== staff) {
    prevStaff[1](staff);
    form.departmentId = staff.department?.id ?? '';
  }

  return (
    <Modal open={!!staff} onClose={onClose} title={`Edit ${staff?.user?.firstName ?? 'staff'}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Save</Button></>}
    >
      <form className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Department (optional)</span>
          <select className="input" value={form.departmentId} onChange={set('departmentId')}>
            <option value="">None</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      </form>
    </Modal>
  );
}

function CreateStaffModal({ open, onClose, onSubmit, loading, roles, departments }) {
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
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Role <span className="text-red-500">*</span></span>
          {roles.length === 0 ? (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              No roles found. Go to <strong>IAM &rsaquo; Roles</strong> to create a role before adding staff.
            </p>
          ) : (
            <select className="input" required value={form.roleId} onChange={set('roleId')}>
              <option value="">Select role…</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName || r.name}</option>)}
            </select>
          )}
        </label>
        <Input label="Employment date" type="date" required value={form.employmentDate} onChange={set('employmentDate')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Department (optional)</span>
          <select className="input" value={form.departmentId} onChange={set('departmentId')}>
            <option value="">None</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <Input label="Qualification (optional)" value={form.qualification} onChange={set('qualification')} />
      </form>
    </Modal>
  );
}
