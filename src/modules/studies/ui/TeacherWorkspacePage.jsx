import { Link } from 'react-router-dom';
import {
  CalendarClock, CalendarRange, BookOpen, ClipboardList, GraduationCap,
  FileText, ChevronRight, Loader2,
} from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import { useTeacherWorkspaceViewModel } from '../viewmodels/useTeacherWorkspaceViewModel';

/**
 * Hub for the teacher workspace. Each section is a self-contained card; the data
 * comes from existing per-module endpoints filtered by teacher userId. Sections
 * currently inline lightweight previews and link to the existing detail pages.
 */
export default function TeacherWorkspacePage() {
  const { routine, subjects, myClasses, assignments, reportCards } = useTeacherWorkspaceViewModel();

  const todays = todayOnly(routine.data);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="My Workspace" subtitle="Everything for your day, your classes, and your students." />
      </Card>

      <SectionGrid>
        <Section
          title="Class to attend"
          subtitle="Today's schedule"
          icon={CalendarClock}
          query={routine}
          to="/workspace/routine"
        >
          {todays.length === 0 ? (
            <p className="text-sm text-ink-500">No classes scheduled for today.</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {todays.map((slot) => (
                <li key={slot.id} className="py-2 text-sm flex items-center justify-between gap-2">
                  <span className="font-medium">{slot.subject?.name ?? 'Subject'}</span>
                  <span className="text-ink-500 text-xs whitespace-nowrap">
                    {slot.classGroup?.name} · {slot.startTime}–{slot.endTime}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Routine"
          subtitle="Full week"
          icon={CalendarRange}
          query={routine}
          to="/workspace/routine"
        >
          <p className="text-sm text-ink-500">
            {(routine.data?.length ?? 0)} period{(routine.data?.length ?? 0) === 1 ? '' : 's'} across the week.
          </p>
        </Section>

        <Section
          title="Subjects you teach"
          subtitle="Subject roles"
          icon={BookOpen}
          query={subjects}
          to="/teacher/classes"
        >
          {(subjects.data ?? []).length === 0 ? (
            <p className="text-sm text-ink-500">No subject assignments yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {(subjects.data ?? []).slice(0, 4).map((a) => (
                <li key={a.id} className="py-2 text-sm flex items-center justify-between gap-2">
                  <span className="font-medium">{a.subject?.name ?? 'Subject'}</span>
                  <span className="text-ink-500 text-xs">{a.classGroup?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Assignments, Tests & Projects"
          subtitle="What you've set"
          icon={ClipboardList}
          query={assignments}
          to="/workspace/assignments"
        >
          {(assignments.data ?? []).length === 0 ? (
            <p className="text-sm text-ink-500">You haven't set anything yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {(assignments.data ?? []).slice(0, 4).map((a) => (
                <li key={a.id} className="py-2 text-sm flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{a.title}</span>
                  <span className="text-ink-500 text-xs whitespace-nowrap">{a.kind ?? 'ASSIGNMENT'}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Class teacher"
          subtitle="Form classes you lead"
          icon={GraduationCap}
          query={myClasses}
          to="/workspace/my-class"
        >
          {(myClasses.data ?? []).length === 0 ? (
            <p className="text-sm text-ink-500">You're not assigned as a class teacher.</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {(myClasses.data ?? []).map((cg) => (
                <li key={cg.id} className="py-2 text-sm flex items-center justify-between gap-2">
                  <span className="font-medium">{cg.name}</span>
                  <span className="text-ink-500 text-xs">{cg.academicYear?.name ?? ''}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Report cards"
          subtitle="Issued for the organization"
          icon={FileText}
          query={reportCards}
          to="/workspace/report-cards"
        >
          {reportCards.isError ? (
            <p className="text-sm text-ink-500">Not authorised to read report cards.</p>
          ) : (
            <p className="text-sm text-ink-500">
              {(reportCards.data?.length ?? 0)} record{(reportCards.data?.length ?? 0) === 1 ? '' : 's'}.
            </p>
          )}
        </Section>
      </SectionGrid>
    </div>
  );
}

function SectionGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  );
}

function Section({ title, subtitle, icon: Icon, query, to, children }) {
  return (
    <Card>
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 grid place-items-center shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100 truncate">{title}</h3>
          <p className="text-xs text-ink-500 truncate">{subtitle}</p>
        </div>
        <Link
          to={to}
          className="text-xs text-brand-700 dark:text-brand-300 hover:underline whitespace-nowrap inline-flex items-center gap-0.5"
        >
          Open <ChevronRight size={14} />
        </Link>
      </div>
      <div className="px-5 pb-5 min-h-16">
        {query?.isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin text-ink-400" size={18} />
          </div>
        ) : query?.isError && !query?.data ? (
          <p className="text-sm text-ink-500">Couldn't load — {query.error?.message ?? 'try again later.'}</p>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

function todayOnly(slots) {
  if (!slots?.length) return [];
  const day = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
  return slots
    .filter((s) => s.dayOfWeek === day)
    .sort((a, b) => (a.periodNumber ?? 0) - (b.periodNumber ?? 0));
}
