import { Award, Plus, Trash2, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import { useEffect, useState } from 'react';
import { useGradesViewModel } from '../viewmodels/useGradesViewModel';
import { useExamSchedulesViewModel } from '../viewmodels/useExamSchedulesViewModel';
import { useStudentsViewModel } from '../../academic/viewmodels/useStudentsViewModel';
import { useSubjectsViewModel } from '../../academic/viewmodels/useSubjectsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function GradesPage() {
  const { list, create, update, remove } = useGradesViewModel();
  const { list: studentsList } = useStudentsViewModel();
  const { list: examSchedulesList } = useExamSchedulesViewModel();
  const { list: subjectsList } = useSubjectsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const canCreate = hasPermission(permissions, 'exams:grades:create');
  const canUpdate = hasPermission(permissions, 'exams:grades:update');
  const canDelete = hasPermission(permissions, 'exams:grades:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Grades"
          subtitle="Record and review student grades by exam."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Record grade</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={Award} title="No grades recorded"
            description="Record a grade to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Record grade</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            { key: 'student', header: 'Student',
              render: (r) => r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : '—' },
            { key: 'exam', header: 'Exam', render: (r) => r.examSchedule?.name ?? '—' },
            { key: 'subject', header: 'Subject', render: (r) => r.subject?.name ?? '—' },
            { key: 'marks', header: 'Marks', render: (r) => `${r.marksObtained ?? '—'} / ${r.maxMarks ?? '—'}` },
            { key: 'grade', header: 'Grade', render: (r) => r.grade ?? '—' },
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
                    <Button variant="ghost" className="!p-2" onClick={() => { if (confirm('Remove this grade?')) remove.mutate(r.id); }}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ),
            },
          ]} />
        )}
      </Card>

      <GradeModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
        title="Record grade"
        students={studentsList.data ?? []}
        examSchedules={examSchedulesList.data ?? []}
        subjects={subjectsList.data ?? []}
      />
      <GradeModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
        title="Edit grade"
        initial={editing ? {
          studentUserId: editing.student?.userId ?? '',
          examScheduleId: editing.examSchedule?.id ?? '',
          subjectId: editing.subject?.id ?? '',
          marksObtained: editing.marksObtained ?? '',
          maxMarks: editing.maxMarks ?? '',
          grade: editing.grade ?? '',
          remarks: editing.remarks ?? '',
        } : undefined}
        students={studentsList.data ?? []}
        examSchedules={examSchedulesList.data ?? []}
        subjects={subjectsList.data ?? []}
      />
    </div>
  );
}

const EMPTY_FORM = { studentUserId: '', examScheduleId: '', subjectId: '', marksObtained: '', maxMarks: '', grade: '', remarks: '' };

function GradeModal({ open, onClose, onSubmit, loading, title, initial, students, examSchedules, subjects }) {
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
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Student <span className="text-red-500">*</span></span>
          <select className="input" required value={form.studentUserId} onChange={set('studentUserId')}>
            <option value="">Select student…</option>
            {students.map((s) => (
              <option key={s.userId} value={s.userId}>
                {s.user?.firstName} {s.user?.lastName}{s.admissionNo ? ` (${s.admissionNo})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Exam schedule <span className="text-red-500">*</span></span>
          <select className="input" required value={form.examScheduleId} onChange={set('examScheduleId')}>
            <option value="">Select exam…</option>
            {examSchedules.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Subject <span className="text-red-500">*</span></span>
          <select className="input" required value={form.subjectId} onChange={set('subjectId')}>
            <option value="">Select subject…</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Marks obtained" type="number" required value={form.marksObtained} onChange={set('marksObtained')} />
          <Input label="Max marks" type="number" required value={form.maxMarks} onChange={set('maxMarks')} />
        </div>
        <Input label="Grade (optional)" value={form.grade} onChange={set('grade')} placeholder="e.g. A+, B" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Remarks</span>
          <textarea className="input" rows={3} value={form.remarks} onChange={set('remarks')} />
        </label>
      </form>
    </Modal>
  );
}
