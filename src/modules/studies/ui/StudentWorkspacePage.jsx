import { BookOpen, ClipboardList, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudentWorkspaceViewModel } from '../viewmodels/useStudentWorkspaceViewModel';

const SUBJECT_COLORS = [
  'bg-violet-100 border-violet-300 dark:bg-violet-900/30 dark:border-violet-700',
  'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
  'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700',
  'bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700',
  'bg-rose-100 border-rose-300 dark:bg-rose-900/30 dark:border-rose-700',
  'bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700',
];

const TEXT_COLORS = [
  'text-violet-700 dark:text-violet-300',
  'text-blue-700 dark:text-blue-300',
  'text-emerald-700 dark:text-emerald-300',
  'text-amber-700 dark:text-amber-300',
  'text-rose-700 dark:text-rose-300',
  'text-cyan-700 dark:text-cyan-300',
];

export default function StudentWorkspacePage() {
  const { offerings } = useStudentWorkspaceViewModel();

  if (offerings.isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-ink-400" size={32} />
      </div>
    );
  }

  if (offerings.isError) {
    const is404 = offerings.error?.status === 404;
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center gap-3 text-ink-400">
        <BookOpen size={40} className="opacity-30" />
        <p className="font-medium text-ink-600 dark:text-ink-300">
          {is404 ? 'Your student profile is not set up yet.' : 'Could not load workspace.'}
        </p>
        <p className="text-sm">
          {is404
            ? 'Ask your administrator to enroll you as a student and assign you to a class group.'
            : offerings.error?.message}
        </p>
      </div>
    );
  }

  const items = offerings.data ?? [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">My Workspace</h1>
        <p className="text-sm text-ink-500 mt-0.5">Your subjects this term</p>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-ink-400">
          <BookOpen size={40} className="mb-3 opacity-40" />
          <p className="font-medium">No subjects yet</p>
          <p className="text-sm mt-1">Your teacher will add subjects soon.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {items.map((offering, i) => {
          const colorIdx = i % SUBJECT_COLORS.length;
          return (
            <Link
              key={offering.id}
              to={`/workspace/subject/${offering.id}`}
              className={`rounded-2xl border-2 p-4 flex flex-col gap-2 active:scale-95 transition-transform ${SUBJECT_COLORS[colorIdx]}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${TEXT_COLORS[colorIdx]} bg-white/60 dark:bg-black/20`}>
                <BookOpen size={18} />
              </div>
              <div>
                <p className={`font-semibold text-sm leading-tight ${TEXT_COLORS[colorIdx]}`}>
                  {offering.subject?.name ?? 'Subject'}
                </p>
                <p className="text-xs text-ink-500 mt-0.5 truncate">
                  {offering.classGroup?.name ?? ''}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
