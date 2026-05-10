import { GraduationCap, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import { useTeacherClassesViewModel } from '../viewmodels/useTeacherClassesViewModel';

export default function TeacherClassesPage() {
  const { classGroups } = useTeacherClassesViewModel();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="My Classes" subtitle="Select a class to manage its subjects." />

        {classGroups.isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-ink-400" size={24} />
          </div>
        )}

        {classGroups.data?.length === 0 && (
          <EmptyState
            icon={GraduationCap}
            title="No classes found"
            description="Class groups will appear here once they are created."
          />
        )}

        {(classGroups.data ?? []).length > 0 && (
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {(classGroups.data ?? []).map((cg) => (
              <Link
                key={cg.id}
                to={`/teacher/class/${cg.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 dark:text-ink-100 truncate">{cg.name}</p>
                  <p className="text-xs text-ink-400 truncate">
                    {cg.academicYear?.name ?? ''}
                    {cg.classTeacher ? ` · ${cg.classTeacher.firstName} ${cg.classTeacher.lastName}` : ''}
                  </p>
                </div>
                <ChevronRight size={16} className="text-ink-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
