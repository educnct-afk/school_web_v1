import { DoorOpen, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { useState } from 'react';
import { useClassroomsViewModel } from '../viewmodels/useClassroomsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

const ROOM_TYPES = ['CLASSROOM', 'LAB', 'HALL', 'OFFICE'];

export default function ClassroomsPage() {
  const { list, create, remove } = useClassroomsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const [openCreate, setOpenCreate] = useState(false);

  const canCreate = hasPermission(permissions, 'academic:classrooms:create');
  const canDelete = hasPermission(permissions, 'academic:classrooms:delete');
  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Classrooms"
          subtitle="Rooms and spaces available for scheduling."
          actions={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add room</Button> : null}
        />
        {list.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {list.data && rows.length === 0 && (
          <EmptyState icon={DoorOpen} title="No classrooms yet"
            description="Add rooms and spaces to use in timetables."
            action={canCreate ? <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> Add room</Button> : null}
          />
        )}
        {rows.length > 0 && (
          <DataTable keyOf={(r) => r.id} rows={rows} columns={[
            { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
            { key: 'type', header: 'Type', render: (r) => <Badge tone="neutral">{r.type}</Badge> },
            { key: 'capacity', header: 'Capacity', render: (r) => r.capacity ?? '—' },
            { key: 'location', header: 'Location', render: (r) => [r.building, r.floor].filter(Boolean).join(' · ') || '—' },
            {
              key: 'actions', header: '',
              render: (r) => canDelete ? (
                <div className="flex justify-end">
                  <Button variant="ghost" className="!p-2" onClick={() => { if (confirm(`Delete ${r.name}?`)) remove.mutate(r.id); }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ) : null,
            },
          ]} />
        )}
      </Card>

      <CreateClassroomModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />
    </div>
  );
}

function CreateClassroomModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', type: 'CLASSROOM', capacity: '', building: '', floor: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Add classroom"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <Input label="Name" required value={form.name} onChange={set('name')} placeholder="e.g. Room 101" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Type</span>
          <select className="input" value={form.type} onChange={set('type')}>
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <Input label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Building" value={form.building} onChange={set('building')} />
          <Input label="Floor" value={form.floor} onChange={set('floor')} />
        </div>
      </form>
    </Modal>
  );
}
