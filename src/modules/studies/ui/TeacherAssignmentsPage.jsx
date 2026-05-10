import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import { useAuthStore } from '@core/stores/authStore';
import { assignmentService } from '../services/studiesService';

const KINDS = [
  { value: 'ASSIGNMENT', label: 'Assignments' },
  { value: 'PROJECT',    label: 'Projects' },
  { value: 'TEST',       label: 'Tests' },
];

export default function TeacherAssignmentsPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const [kind, setKind] = useState('ASSIGNMENT');

  const list = useQuery({
    queryKey: ['workspace', 'teacher', 'assignments', userId, kind],
    queryFn: () => assignmentService.byTeacher(userId, kind),
    enabled: !!userId,
  });

  const rows = list.data ?? [];

  return (
    <Card>
      <CardHeader title="Assignments, Tests & Projects" subtitle="Filter by kind to scope the list." />

      <div className="px-6 pb-3 flex gap-2">
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => setKind(k.value)}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg transition',
              k.value === kind
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200 hover:bg-ink-200 dark:hover:bg-ink-700'
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {list.isLoading && (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-ink-400" size={20} /></div>
      )}

      {!list.isLoading && rows.length === 0 && (
        <EmptyState icon={ClipboardList} title={`No ${kind.toLowerCase()}s yet`} description="Set one from the relevant subject." />
      )}

      {rows.length > 0 && (
        <ul className="px-6 pb-6 divide-y divide-ink-100 dark:divide-ink-800">
          {rows.map((a) => (
            <li key={a.id} className="py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-ink-500 truncate">
                  {a.subjectOffering?.subject?.name ?? 'Subject'} · {a.subjectOffering?.classGroup?.name ?? ''}
                </p>
              </div>
              <span className="text-xs text-ink-500 whitespace-nowrap">
                {a.dueAt ? `Due ${new Date(a.dueAt).toLocaleDateString()}` : 'No due date'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
