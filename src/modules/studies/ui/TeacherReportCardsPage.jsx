import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import EmptyState from '@core/ui/EmptyState';
import { useAuthStore } from '@core/stores/authStore';
import { reportCardService } from '@modules/exams/services/examsService';

export default function TeacherReportCardsPage() {
  const orgId = useAuthStore((s) => s.organization?.id);
  const list = useQuery({
    queryKey: ['workspace', 'teacher', 'report-cards', orgId],
    queryFn: () => reportCardService.byOrg(orgId),
    enabled: !!orgId,
    retry: false,
  });

  if (list.isError) {
    return (
      <Card>
        <CardHeader title="Report cards" subtitle="Records issued for your organization." />
        <EmptyState
          icon={FileText}
          title="Couldn't load report cards"
          description={list.error?.message ?? 'You may not have permission to read all report cards.'}
        />
      </Card>
    );
  }

  const rows = list.data ?? [];

  return (
    <Card>
      <CardHeader title="Report cards" subtitle="Records issued for your organization." />

      {list.isLoading && (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ink-400" size={20} /></div>
      )}

      {!list.isLoading && rows.length === 0 && (
        <EmptyState icon={FileText} title="No report cards yet" description="Issued cards will appear here." />
      )}

      {rows.length > 0 && (
        <ul className="divide-y divide-ink-100 dark:divide-ink-800">
          {rows.map((rc) => (
            <li key={rc.id} className="px-6 py-3 text-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {rc.student?.firstName} {rc.student?.lastName}
                </p>
                <p className="text-xs text-ink-500 truncate">
                  {rc.term?.name ?? ''} · {rc.academicYear?.name ?? ''}
                </p>
              </div>
              <span className="text-xs text-ink-500 whitespace-nowrap">
                {rc.issuedAt ? new Date(rc.issuedAt).toLocaleDateString() : 'Draft'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
