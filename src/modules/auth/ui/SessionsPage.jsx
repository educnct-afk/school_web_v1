import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Badge from '@core/ui/Badge';
import { Monitor, Trash2 } from 'lucide-react';
import { useSessionsViewModel } from '../viewmodels/useSessionsViewModel';

export default function SessionsPage() {
  const { list, revoke, revokeAll } = useSessionsViewModel();

  return (
    <div className="max-w-4xl space-y-4">
      <Card>
        <CardHeader
          title="Active sessions"
          subtitle="Devices currently signed in to your account."
          actions={
            list.data?.length ? (
              <Button variant="outline" onClick={() => revokeAll.mutate()} loading={revokeAll.isPending}>
                Revoke all
              </Button>
            ) : null
          }
        />

        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && list.data.length === 0 && (
          <EmptyState icon={Monitor} title="No active sessions" description="When you sign in, we'll list your devices here." />
        )}

        {list.data && list.data.length > 0 && (
          <DataTable
            keyOf={(r) => r.id}
            rows={list.data}
            columns={[
              { key: 'device', header: 'Device', render: (r) => r.deviceInfo || 'Unknown' },
              { key: 'ip', header: 'IP', render: (r) => r.ipAddress || '—' },
              { key: 'expires', header: 'Expires', render: (r) => r.expiresAt ? new Date(r.expiresAt).toLocaleString() : '—' },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={r.isValid ? 'success' : 'neutral'}>{r.isValid ? 'Active' : 'Expired'}</Badge> },
              {
                key: 'actions', header: '',
                render: (r) => (
                  <Button variant="ghost" className="!p-2" onClick={() => revoke.mutate(r.id)} aria-label="Revoke">
                    <Trash2 size={16} />
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
