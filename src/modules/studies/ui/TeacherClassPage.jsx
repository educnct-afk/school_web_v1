import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import { useAuthStore } from '@core/stores/authStore';
import { classGroupService } from '@modules/academic/services/academicService';

export default function TeacherClassPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const list = useQuery({
    queryKey: ['workspace', 'teacher', 'my-classes', userId],
    queryFn: () => classGroupService.byClassTeacher(userId),
    enabled: !!userId,
  });

  const rows = list.data ?? [];

  return (
    <Card>
      <CardHeader title="My class" subtitle="Form classes you're the class teacher for." />

      {list.isLoading && (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ink-400" size={20} /></div>
      )}

      {!list.isLoading && rows.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No form classes"
          description="You're not currently assigned as a class teacher to any group."
        />
      )}

      {rows.length > 0 && (
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {rows.map((cg) => (
            <Link
              key={cg.id}
              to={`/teacher/class/${cg.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 grid place-items-center shrink-0">
                <GraduationCap size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{cg.name}</p>
                <p className="text-xs text-ink-500 truncate">
                  Grade {cg.gradeLevel ?? '—'} · {cg.section ?? '—'} · {cg.academicYear?.name ?? ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
