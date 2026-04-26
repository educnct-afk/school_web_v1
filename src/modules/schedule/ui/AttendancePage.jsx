import { ClipboardCheck, Save } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Avatar from '@core/ui/Avatar';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAttendanceViewModel } from '../viewmodels/useAttendanceViewModel';
import { useClassGroupsViewModel } from '../../academic/viewmodels/useClassGroupsViewModel';
import { studentService } from '../../academic/services/academicService';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

const STATUSES = [
  { value: 'PRESENT', label: 'Present', tone: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'ABSENT', label: 'Absent', tone: 'text-red-700 bg-red-50 border-red-200' },
  { value: 'LATE', label: 'Late', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'EXCUSED', label: 'Excused', tone: 'text-blue-700 bg-blue-50 border-blue-200' },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendancePage() {
  const permissions = useAuthStore((s) => s.permissions);
  const canMark = hasPermission(permissions, 'schedule:attendance:create');

  const [classGroupId, setClassGroupId] = useState('');
  const [date, setDate] = useState(today());

  const { list: classGroupsList } = useClassGroupsViewModel();
  const { list: attendanceList, markBulk } = useAttendanceViewModel({ classGroupId, date });

  const studentsQuery = useQuery({
    queryKey: ['academic', 'students', 'byClassGroup', classGroupId],
    queryFn: () => studentService.byClassGroup(classGroupId),
    enabled: !!classGroupId,
  });

  const students = studentsQuery.data ?? [];
  const records = attendanceList.data ?? [];

  const recordByStudentId = useMemo(() => {
    const map = {};
    for (const r of records) map[r.student?.id] = r;
    return map;
  }, [records]);

  const [draft, setDraft] = useState({});

  useEffect(() => {
    const next = {};
    for (const s of students) {
      const existing = recordByStudentId[s.userId];
      next[s.userId] = {
        status: existing?.status ?? 'PRESENT',
        notes: existing?.notes ?? '',
      };
    }
    setDraft(next);
  }, [students, recordByStudentId]);

  const setStatus = (userId, status) =>
    setDraft((d) => ({ ...d, [userId]: { ...(d[userId] ?? {}), status } }));

  const submit = () => {
    const entries = students.map((s) => ({
      studentUserId: s.userId,
      status: draft[s.userId]?.status ?? 'PRESENT',
      notes: draft[s.userId]?.notes || null,
    }));
    markBulk.mutate(entries);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Attendance"
          subtitle="Mark daily attendance for a class group."
          actions={canMark && classGroupId && students.length > 0 ? (
            <Button onClick={submit} loading={markBulk.isPending}><Save size={16} /> Save</Button>
          ) : null}
        />
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Class group</span>
            <select className="input" value={classGroupId} onChange={(e) => setClassGroupId(e.target.value)}>
              <option value="">Select a class group…</option>
              {(classGroupsList.data ?? []).map((g) => (
                <option key={g.id} value={g.id}>{g.name} {g.academicYear?.name ? `(${g.academicYear.name})` : ''}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Date</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        {!classGroupId && (
          <EmptyState icon={ClipboardCheck} title="Pick a class group"
            description="Choose a class group and date to take attendance." />
        )}

        {classGroupId && studentsQuery.isLoading && <p className="text-sm text-ink-500">Loading students…</p>}

        {classGroupId && studentsQuery.data && students.length === 0 && (
          <EmptyState icon={ClipboardCheck} title="No students in this class group"
            description="Add students to this class group before taking attendance." />
        )}

        {classGroupId && students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 border-b border-ink-100 text-ink-500 font-medium">Student</th>
                  <th className="text-left py-2 px-3 border-b border-ink-100 text-ink-500 font-medium w-[420px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const current = draft[s.userId]?.status ?? 'PRESENT';
                  return (
                    <tr key={s.userId}>
                      <td className="py-2 px-3 border-b border-ink-100">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{s.user?.firstName} {s.user?.lastName}</p>
                            <p className="text-xs text-ink-500 truncate">{s.admissionNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-b border-ink-100">
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map((opt) => {
                            const active = current === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                disabled={!canMark}
                                onClick={() => setStatus(s.userId, opt.value)}
                                className={`px-3 py-1 rounded-md border text-xs font-medium transition ${active ? opt.tone : 'text-ink-500 border-ink-200 hover:border-ink-300'}`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
