import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Input from '@core/ui/Input';
import Badge from '@core/ui/Badge';
import { useAuditLogViewModel } from '../viewmodels/useAuditLogViewModel';

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', entityType: '', from: '', to: '' });
  const { list } = useAuditLogViewModel(filters);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Audit log" subtitle="Record of changes made in this organization." />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Input label="Action" value={filters.action} onChange={set('action')} placeholder="e.g. CREATE" />
          <Input label="Entity type" value={filters.entityType} onChange={set('entityType')} placeholder="e.g. User" />
          <Input label="From" type="datetime-local" value={filters.from} onChange={set('from')} />
          <Input label="To" type="datetime-local" value={filters.to} onChange={set('to')} />
        </div>

        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={ScrollText} title="No activity" description="Nothing matches your filters." />
        )}

        {rows.length > 0 && (
          <DataTable
            keyOf={(r) => r.id}
            rows={rows}
            columns={[
              {
                key: 'when', header: 'When',
                render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '—',
              },
              { key: 'action', header: 'Action', render: (r) => <Badge tone="brand">{r.action}</Badge> },
              { key: 'entity', header: 'Entity', render: (r) => `${r.entityType ?? ''} ${r.entityId ? `· ${r.entityId.slice(0, 8)}…` : ''}` },
              { key: 'actor', header: 'Actor', render: (r) => r.actorEmail || r.actorId?.slice(0, 8) || '—' },
              { key: 'ip', header: 'IP', render: (r) => r.ipAddress || '—' },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
