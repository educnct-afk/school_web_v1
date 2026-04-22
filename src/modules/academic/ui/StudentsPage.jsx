import { GraduationCap, Plus, Trash2, Pencil, UserPlus } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Avatar from '@core/ui/Avatar';
import { useState } from 'react';
import { useStudentsViewModel } from '../viewmodels/useStudentsViewModel';
import { useClassGroupsViewModel } from '../viewmodels/useClassGroupsViewModel';
import { useRolesViewModel } from '../../iam/viewmodels/useRolesViewModel';
import { useGuardiansViewModel } from '../viewmodels/useGuardiansViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

const RELATIONSHIPS = ['FATHER', 'MOTHER', 'GUARDIAN', 'SIBLING', 'OTHER'];

export default function StudentsPage() {
  const { list, create, update, remove } = useStudentsViewModel();
  const { list: classGroupsList } = useClassGroupsViewModel();
  const { list: rolesList } = useRolesViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [addingGuardianFor, setAddingGuardianFor] = useState(null);

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
              render: (r) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" className="!p-2" title="Add guardian" onClick={() => setAddingGuardianFor(r)}>
                    <UserPlus size={16} />
                  </Button>
                  <Button variant="ghost" className="!p-2" title="Edit" onClick={() => setEditing(r)}>
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

      <CreateStudentModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
        classGroups={classGroupsList.data ?? []}
        roles={rolesList.data ?? []}
      />
      <EditStudentModal
        student={editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ userId: editing.userId, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
        classGroups={classGroupsList.data ?? []}
      />
      <AddGuardianModal
        student={addingGuardianFor}
        onClose={() => setAddingGuardianFor(null)}
        roles={rolesList.data ?? []}
      />
    </div>
  );
}

function CreateStudentModal({ open, onClose, onSubmit, loading, classGroups, roles }) {
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', password: '',
    admissionNo: '', classGroupId: '', enrollmentDate: '', roleId: '',
    dateOfBirth: '', phone: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const noClassGroups = classGroups.length === 0;
  const noRoles = roles.length === 0;

  return (
    <Modal open={open} onClose={onClose} title="Add student"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading} disabled={noClassGroups || noRoles}>Create</Button></>}
    >
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" required value={form.firstName} onChange={set('firstName')} />
          <Input label="Last name" required value={form.lastName} onChange={set('lastName')} />
        </div>
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Input label="Temporary password" type="password" required value={form.password} onChange={set('password')} />
        <Input label="Admission number" required value={form.admissionNo} onChange={set('admissionNo')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Role <span className="text-red-500">*</span></span>
          {noRoles ? (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              No roles found. Go to <strong>IAM &rsaquo; Roles</strong> to create a role first.
            </p>
          ) : (
            <select className="input" required value={form.roleId} onChange={set('roleId')}>
              <option value="">Select student role…</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName || r.name}</option>)}
            </select>
          )}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Class group <span className="text-red-500">*</span></span>
          {noClassGroups ? (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              No class groups found. Go to <strong>Academic &rsaquo; Class Groups</strong> to create one first.
            </p>
          ) : (
            <select className="input" required value={form.classGroupId} onChange={set('classGroupId')}>
              <option value="">Select class group…</option>
              {classGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}{g.academicYear?.name ? ` (${g.academicYear.name})` : ''}
                </option>
              ))}
            </select>
          )}
        </label>
        <Input label="Enrollment date" type="date" required value={form.enrollmentDate} onChange={set('enrollmentDate')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date of birth (optional)" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
          <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} />
        </div>
      </form>
    </Modal>
  );
}

function EditStudentModal({ student, onClose, onSubmit, loading, classGroups }) {
  const [form, setForm] = useState({ classGroupId: '', dateOfBirth: '', phone: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const prevStudent = useState(null);
  if (student && prevStudent[0] !== student) {
    prevStudent[1](student);
    form.classGroupId = student.classGroup?.id ?? '';
    form.dateOfBirth = student.dateOfBirth ?? '';
    form.phone = student.user?.phone ?? '';
  }

  return (
    <Modal open={!!student} onClose={onClose} title={`Edit ${student?.user?.firstName ?? 'student'}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Save</Button></>}
    >
      <form className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Class group</span>
          <select className="input" value={form.classGroupId} onChange={set('classGroupId')}>
            <option value="">Select class group…</option>
            {classGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}{g.academicYear?.name ? ` (${g.academicYear.name})` : ''}
              </option>
            ))}
          </select>
        </label>
        <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
        <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
      </form>
    </Modal>
  );
}

function AddGuardianModal({ student, onClose, roles }) {
  const { createAndLink } = useGuardiansViewModel();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    occupation: '', address: '', roleId: '', relationship: '', isPrimary: false,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    const { relationship, isPrimary, ...guardianFields } = form;
    createAndLink.mutate(
      { guardianPayload: guardianFields, studentUserId: student.userId, relationship, isPrimary },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal open={!!student} onClose={onClose} title={`Add guardian for ${student?.user?.firstName ?? 'student'}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} loading={createAndLink.isPending}>Add guardian</Button></>}
    >
      <form className="space-y-4">
        <p className="text-sm text-ink-500">Create a guardian account and link them to this student.</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" required value={form.firstName} onChange={set('firstName')} />
          <Input label="Last name" required value={form.lastName} onChange={set('lastName')} />
        </div>
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Input label="Temporary password" type="password" required value={form.password} onChange={set('password')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Role <span className="text-red-500">*</span></span>
          <select className="input" required value={form.roleId} onChange={set('roleId')}>
            <option value="">Select guardian role…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.displayName || r.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} />
          <Input label="Occupation (optional)" value={form.occupation} onChange={set('occupation')} />
        </div>
        <Input label="Address (optional)" value={form.address} onChange={set('address')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Relationship <span className="text-red-500">*</span></span>
          <select className="input" required value={form.relationship} onChange={set('relationship')}>
            <option value="">Select relationship…</option>
            {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))} />
          Primary guardian
        </label>
      </form>
    </Modal>
  );
}

