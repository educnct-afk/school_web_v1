import { CalendarClock, Plus, Trash2, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import { useEffect, useState } from 'react';
import { useExamSchedulesViewModel } from '../viewmodels/useExamSchedulesViewModel';
import { useClassGroupsViewModel } from '../../academic/viewmodels/useClassGroupsViewModel';
import { useAcademicYearsViewModel } from '../../academic/viewmodels/useAcademicYearsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

const EXAM_TYPES = ['MIDTERM', 'FINAL', 'QUIZ', 'PRACTICAL'];

export default function ExamSchedulesPage() {
  const { list, create, update, remove } = useExamSchedulesViewModel();
  const { list: classGroupsList } = useClassGroupsViewModel();
  const { list: academicYearsList } = useAcademicYearsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const canCreate = hasPermission(permissions, 'exams:exam-schedules:create');
  const canUpdate = hasPermission(permissions, 'exams:exam-schedules:update');
  const canDelete = hasPermission(permissions, 'exams:exam-schedules:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Exam schedules"
          subtitle="Plan and publish exam dates by class group and term."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add exam schedule</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={CalendarClock} title="No exam schedules yet"
            description="Plan an exam to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add exam schedule</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
            { key: 'examType', header: 'Type', render: (r) => r.examType ?? '—' },
            { key: 'classGroup', header: 'Class', render: (r) => r.classGroup?.name ?? '—' },
            { key: 'academicYear', header: 'Year', render: (r) => r.academicYear?.name ?? '—' },
            { key: 'startDate', header: 'Start', render: (r) => r.startDate ?? '—' },
            { key: 'endDate', header: 'End', render: (r) => r.endDate ?? '—' },
            {
              key: 'actions', header: '',
              render: (r) => (
                <div className="flex justify-end gap-1">
                  {canUpdate && (
                    <Button variant="ghost" className="!p-2" title="Edit" onClick={() => setEditing(r)}>
                      <Pencil size={16} />
                    </Button>
                  )}
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

      <ExamScheduleModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
        title="Add exam schedule"
        classGroups={classGroupsList.data ?? []}
        academicYears={academicYearsList.data ?? []}
      />
      <ExamScheduleModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
        title={editing ? `Edit ${editing.name}` : ''}
        initial={editing ? {
          name: editing.name ?? '',
          examType: editing.examType ?? '',
          classGroupId: editing.classGroup?.id ?? '',
          academicYearId: editing.academicYear?.id ?? '',
          startDate: editing.startDate ?? '',
          endDate: editing.endDate ?? '',
          description: editing.description ?? '',
        } : undefined}
        classGroups={classGroupsList.data ?? []}
        academicYears={academicYearsList.data ?? []}
      />
    </div>
  );
}

const EMPTY_FORM = { name: '', examType: '', classGroupId: '', academicYearId: '', startDate: '', endDate: '', description: '' };

function ExamScheduleModal({ open, onClose, onSubmit, loading, title, initial, classGroups, academicYears }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) setForm(initial ?? EMPTY_FORM);
  }, [open, initial]);

  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Save</Button></>}
    >
      <form className="space-y-4">
        <Input label="Name" required value={form.name} onChange={set('name')} placeholder="e.g. Term 1 Mid-term" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Type <span className="text-red-500">*</span></span>
          <select className="input" required value={form.examType} onChange={set('examType')}>
            <option value="">Select type…</option>
            {EXAM_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Class group <span className="text-red-500">*</span></span>
          <select className="input" required value={form.classGroupId} onChange={set('classGroupId')}>
            <option value="">Select class group…</option>
            {classGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}{g.academicYear?.name ? ` (${g.academicYear.name})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Academic year <span className="text-red-500">*</span></span>
          <select className="input" required value={form.academicYearId} onChange={set('academicYearId')}>
            <option value="">Select academic year…</option>
            {academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" required value={form.startDate} onChange={set('startDate')} />
          <Input label="End date" type="date" required value={form.endDate} onChange={set('endDate')} />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Description</span>
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
        </label>
      </form>
    </Modal>
  );
}
