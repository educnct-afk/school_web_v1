import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Avatar from '@core/ui/Avatar';
import { useState } from 'react';
import { useStudentsViewModel } from '../viewmodels/useStudentsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function StudentsPage() {
  const { list, create, remove } = useStudentsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);

  const canCreate = hasPermission(permissions, 'academic:students:create');
  const canDelete = hasPermission(permissions, 'academic:students:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Students"
          subtitle="All enrolled students in this organization."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add student</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={GraduationCap} title="No students yet"
            description="Add the first student to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add student</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.userId} rows={rows} columns={[
            {
              key: 'who', header: 'Student',
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
            { key: 'admissionNo', header: 'Admission No.', render: (r) => r.admissionNo },
            { key: 'classGroup', header: 'Class', render: (r) => r.classGroup?.name ?? '—' },
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

      <CreateStudentModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />
    </div>
  );
}

function CreateStudentModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', password: '',
    admissionNo: '', classGroupId: '', enrollmentDate: '', roleId: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Add student"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" required value={form.firstName} onChange={set('firstName')} />
          <Input label="Last name" required value={form.lastName} onChange={set('lastName')} />
        </div>
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Input label="Temporary password" type="password" required value={form.password} onChange={set('password')} />
        <Input label="Admission number" required value={form.admissionNo} onChange={set('admissionNo')} />
        <Input label="Role ID" required value={form.roleId} onChange={set('roleId')} />
        <Input label="Class group ID" required value={form.classGroupId} onChange={set('classGroupId')} />
        <Input label="Enrollment date" type="date" required value={form.enrollmentDate} onChange={set('enrollmentDate')} />
      </form>
    </Modal>
  );
}
