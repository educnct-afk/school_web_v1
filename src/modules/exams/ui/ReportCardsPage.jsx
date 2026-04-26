import { FileText, Plus, Trash2, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import { useEffect, useState } from 'react';
import { useReportCardsViewModel } from '../viewmodels/useReportCardsViewModel';
import { useStudentsViewModel } from '../../academic/viewmodels/useStudentsViewModel';
import { useAcademicYearsViewModel } from '../../academic/viewmodels/useAcademicYearsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function ReportCardsPage() {
  const { list, create, update, remove } = useReportCardsViewModel();
  const { list: studentsList } = useStudentsViewModel();
  const { list: academicYearsList } = useAcademicYearsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const canCreate = hasPermission(permissions, 'exams:report-cards:create');
  const canUpdate = hasPermission(permissions, 'exams:report-cards:update');
  const canDelete = hasPermission(permissions, 'exams:report-cards:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Report cards"
          subtitle="Generate and distribute end-of-term report cards."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add report card</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={FileText} title="No report cards yet"
            description="Generate the first report card to get started."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add report card</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            { key: 'student', header: 'Student',
              render: (r) => r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : '—' },
            { key: 'year', header: 'Academic year', render: (r) => r.academicYear?.name ?? '—' },
            { key: 'overallGrade', header: 'Grade', render: (r) => r.overallGrade ?? '—' },
            { key: 'overallPercentage', header: '%', render: (r) => r.overallPercentage != null ? `${r.overallPercentage}%` : '—' },
            { key: 'publishedAt', header: 'Published', render: (r) => r.publishedAt ?? '—' },
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
                    <Button variant="ghost" className="!p-2" onClick={() => { if (confirm('Delete this report card?')) remove.mutate(r.id); }}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ),
            },
          ]} />
        )}
      </Card>

      <ReportCardModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
        title="Add report card"
        students={studentsList.data ?? []}
        academicYears={academicYearsList.data ?? []}
      />
      <ReportCardModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
        title="Edit report card"
        initial={editing ? {
          studentUserId: editing.student?.userId ?? '',
          academicYearId: editing.academicYear?.id ?? '',
          overallGrade: editing.overallGrade ?? '',
          overallPercentage: editing.overallPercentage ?? '',
          remarks: editing.remarks ?? '',
          publishedAt: editing.publishedAt ?? '',
        } : undefined}
        students={studentsList.data ?? []}
        academicYears={academicYearsList.data ?? []}
      />
    </div>
  );
}

const EMPTY_FORM = { studentUserId: '', academicYearId: '', overallGrade: '', overallPercentage: '', remarks: '', publishedAt: '' };

function ReportCardModal({ open, onClose, onSubmit, loading, title, initial, students, academicYears }) {
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
          <span className="mb-1.5 block text-sm font-medium">Academic year <span className="text-red-500">*</span></span>
          <select className="input" required value={form.academicYearId} onChange={set('academicYearId')}>
            <option value="">Select academic year…</option>
            {academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Overall grade (optional)" value={form.overallGrade} onChange={set('overallGrade')} placeholder="e.g. A" />
          <Input label="Overall %" type="number" value={form.overallPercentage} onChange={set('overallPercentage')} />
        </div>
        <Input label="Published at (optional)" type="date" value={form.publishedAt} onChange={set('publishedAt')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Remarks</span>
          <textarea className="input" rows={3} value={form.remarks} onChange={set('remarks')} />
        </label>
      </form>
    </Modal>
  );
}
