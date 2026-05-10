import { useQuery } from '@tanstack/react-query';
import { CalendarRange, Loader2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import { useAuthStore } from '@core/stores/authStore';
import { timetableService } from '@modules/schedule/services/scheduleService';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function TeacherRoutinePage() {
  const userId = useAuthStore((s) => s.user?.id);
  const routine = useQuery({
    queryKey: ['workspace', 'teacher', 'routine', userId],
    queryFn: () => timetableService.byTeacher(userId),
    enabled: !!userId,
  });

  const byDay = groupByDay(routine.data ?? []);

  return (
    <Card>
      <CardHeader title="My routine" subtitle="Your weekly periods, by day." />

      {routine.isLoading && (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ink-400" size={20} /></div>
      )}

      {!routine.isLoading && (routine.data?.length ?? 0) === 0 && (
        <EmptyState icon={CalendarRange} title="No periods" description="You don't have any timetable slots yet." />
      )}

      {(routine.data?.length ?? 0) > 0 && (
        <div className="px-6 pb-6 space-y-5">
          {DAYS.map((day) => {
            const slots = byDay[day] ?? [];
            if (!slots.length) return null;
            return (
              <div key={day}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-2">
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </h3>
                <ul className="divide-y divide-ink-100 dark:divide-ink-800 rounded-lg border border-ink-100 dark:border-ink-800">
                  {slots.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="w-12 text-ink-500 text-xs">P{s.periodNumber}</span>
                      <span className="flex-1 font-medium truncate">{s.subject?.name ?? 'Subject'}</span>
                      <span className="text-ink-500 text-xs whitespace-nowrap">{s.classGroup?.name}</span>
                      <span className="text-ink-400 text-xs whitespace-nowrap">{s.startTime}–{s.endTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function groupByDay(slots) {
  const out = {};
  for (const s of slots) {
    if (!out[s.dayOfWeek]) out[s.dayOfWeek] = [];
    out[s.dayOfWeek].push(s);
  }
  for (const d of Object.keys(out)) {
    out[d].sort((a, b) => (a.periodNumber ?? 0) - (b.periodNumber ?? 0));
  }
  return out;
}
