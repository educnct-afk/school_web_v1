import { CalendarRange, Plus, Trash2, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import { useEffect, useMemo, useState } from 'react';
import { useTimetableViewModel } from '../viewmodels/useTimetableViewModel';
import { useClassGroupsViewModel } from '../../academic/viewmodels/useClassGroupsViewModel';
import { useSubjectsViewModel } from '../../academic/viewmodels/useSubjectsViewModel';
import { useStaffViewModel } from '../../academic/viewmodels/useStaffViewModel';
import { useClassroomsViewModel } from '../../academic/viewmodels/useClassroomsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat' };
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablePage() {
  const permissions = useAuthStore((s) => s.permissions);
  const canCreate = hasPermission(permissions, 'schedule:timetable:create');
  const canUpdate = hasPermission(permissions, 'schedule:timetable:update');
  const canDelete = hasPermission(permissions, 'schedule:timetable:delete');

  const { list: classGroupsList } = useClassGroupsViewModel();
  const { list: subjectsList } = useSubjectsViewModel();
  const { list: staffList } = useStaffViewModel();
  const { list: classroomsList } = useClassroomsViewModel();

  const [classGroupId, setClassGroupId] = useState('');
  const [editingSlot, setEditingSlot] = useState(null);
  const [creatingCell, setCreatingCell] = useState(null);

  const { list, create, update, remove } = useTimetableViewModel(classGroupId);
  const slots = list.data ?? [];

  const classGroup = useMemo(
    () => (classGroupsList.data ?? []).find((g) => g.id === classGroupId),
    [classGroupsList.data, classGroupId]
  );

  const grid = useMemo(() => {
    const map = {};
    for (const s of slots) map[`${s.dayOfWeek}-${s.periodNumber}`] = s;
    return map;
  }, [slots]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Timetable"
          subtitle="Weekly class schedule by class group."
        />
        <div className="mb-4">
          <label className="block max-w-sm">
            <span className="mb-1.5 block text-sm font-medium">Class group</span>
            <select className="input" value={classGroupId} onChange={(e) => setClassGroupId(e.target.value)}>
              <option value="">Select a class group…</option>
              {(classGroupsList.data ?? []).map((g) => (
                <option key={g.id} value={g.id}>{g.name} {g.academicYear?.name ? `(${g.academicYear.name})` : ''}</option>
              ))}
            </select>
          </label>
        </div>

        {!classGroupId && (
          <EmptyState icon={CalendarRange} title="Pick a class group"
            description="Choose a class group to view or edit its weekly timetable." />
        )}

        {classGroupId && list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}

        {classGroupId && list.data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 border-b border-ink-100 w-20 text-ink-500 font-medium">Period</th>
                  {DAYS.map((d) => (
                    <th key={d} className="text-left py-2 px-3 border-b border-ink-100 text-ink-500 font-medium">{DAY_LABELS[d]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p) => (
                  <tr key={p}>
                    <td className="py-2 px-3 border-b border-ink-100 align-top font-medium text-ink-600">{p}</td>
                    {DAYS.map((d) => {
                      const slot = grid[`${d}-${p}`];
                      return (
                        <td key={d} className="py-2 px-3 border-b border-ink-100 align-top">
                          {slot ? (
                            <div className="rounded-md bg-brand-50 border border-brand-100 p-2">
                              <p className="font-medium text-ink-800 truncate">{slot.subject?.name ?? '—'}</p>
                              <p className="text-xs text-ink-600 truncate">
                                {slot.teacher ? `${slot.teacher.firstName} ${slot.teacher.lastName}` : 'No teacher'}
                              </p>
                              <p className="text-xs text-ink-500">{slot.startTime}–{slot.endTime}</p>
                              {(canUpdate || canDelete) && (
                                <div className="mt-1 flex gap-1">
                                  {canUpdate && (
                                    <button className="text-ink-500 hover:text-ink-700" onClick={() => setEditingSlot(slot)}>
                                      <Pencil size={14} />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button className="text-ink-500 hover:text-red-600"
                                      onClick={() => { if (confirm('Remove this slot?')) remove.mutate(slot.id); }}>
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : canCreate ? (
                            <button
                              className="w-full rounded-md border border-dashed border-ink-200 py-2 text-ink-400 hover:text-ink-600 hover:border-ink-300"
                              onClick={() => setCreatingCell({ dayOfWeek: d, periodNumber: p })}
                            >
                              <Plus size={14} className="inline" />
                            </button>
                          ) : <span className="text-ink-300">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SlotModal
        open={!!creatingCell}
        onClose={() => setCreatingCell(null)}
        onSubmit={(payload) => create.mutate(
          { ...payload, academicYearId: classGroup?.academicYear?.id, classGroupId, ...creatingCell },
          { onSuccess: () => setCreatingCell(null) }
        )}
        loading={create.isPending}
        title={creatingCell ? `Add slot — ${DAY_LABELS[creatingCell.dayOfWeek]} period ${creatingCell.periodNumber}` : ''}
        subjects={subjectsList.data ?? []}
        teachers={staffList.data ?? []}
        classrooms={classroomsList.data ?? []}
      />

      <SlotModal
        open={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        onSubmit={(payload) => update.mutate(
          { id: editingSlot.id, payload: {
            ...payload,
            academicYearId: editingSlot.academicYear?.id,
            classGroupId: editingSlot.classGroup?.id,
            dayOfWeek: editingSlot.dayOfWeek,
            periodNumber: editingSlot.periodNumber,
          }},
          { onSuccess: () => setEditingSlot(null) }
        )}
        loading={update.isPending}
        initial={editingSlot ? {
          subjectId: editingSlot.subject?.id ?? '',
          teacherUserId: editingSlot.teacher?.id ?? '',
          classroomId: editingSlot.classroom?.id ?? '',
          startTime: editingSlot.startTime ?? '',
          endTime: editingSlot.endTime ?? '',
        } : undefined}
        title={editingSlot ? `Edit slot — ${DAY_LABELS[editingSlot.dayOfWeek]} period ${editingSlot.periodNumber}` : ''}
        subjects={subjectsList.data ?? []}
        teachers={staffList.data ?? []}
        classrooms={classroomsList.data ?? []}
      />
    </div>
  );
}

const EMPTY_SLOT_FORM = { subjectId: '', teacherUserId: '', classroomId: '', startTime: '', endTime: '' };

function SlotModal({ open, onClose, onSubmit, loading, title, initial, subjects, teachers, classrooms }) {
  const [form, setForm] = useState(EMPTY_SLOT_FORM);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) setForm(initial ?? EMPTY_SLOT_FORM);
  }, [open, initial]);

  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Save</Button></>}
    >
      <form className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Subject <span className="text-red-500">*</span></span>
          <select className="input" required value={form.subjectId} onChange={set('subjectId')}>
            <option value="">Select subject…</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Teacher</span>
          <select className="input" value={form.teacherUserId} onChange={set('teacherUserId')}>
            <option value="">No teacher assigned</option>
            {teachers.map((t) => (
              <option key={t.userId} value={t.userId}>{t.user?.firstName} {t.user?.lastName}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Classroom</span>
          <select className="input" value={form.classroomId} onChange={set('classroomId')}>
            <option value="">No classroom</option>
            {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start time" type="time" required value={form.startTime} onChange={set('startTime')} />
          <Input label="End time" type="time" required value={form.endTime} onChange={set('endTime')} />
        </div>
      </form>
    </Modal>
  );
}
