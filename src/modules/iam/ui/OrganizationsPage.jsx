import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Plus, Trash2, Pencil } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import EmptyState from '@core/ui/EmptyState';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import Badge from '@core/ui/Badge';
import { SkeletonTable } from '@core/ui/Skeleton';
import { useConfirm } from '@core/ui/ConfirmDialog';
import { useOrganizationsViewModel } from '../viewmodels/useOrganizationsViewModel';
import { hasPermission } from '@core/auth/hasPermission';
import { useAuthStore } from '@core/stores/authStore';

export default function OrganizationsPage() {
  const { list, create, update, remove } = useOrganizationsViewModel();
  const permissions = useAuthStore((s) => s.permissions);
  const confirm = useConfirm();

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const canCreate = hasPermission(permissions, 'iam:organizations:create');
  const canUpdate = hasPermission(permissions, 'iam:organizations:update');
  const canDelete = hasPermission(permissions, 'iam:organizations:delete');

  const rows = list.data ?? [];

  async function handleDelete(r) {
    const ok = await confirm({
      title: 'Delete organization?',
      description: `"${r.name}" and all its data will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (ok) remove.mutate(r.id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Organizations"
          subtitle="Tenants on this platform."
          actions={
            canCreate ? (
              <Button onClick={() => setOpenCreate(true)}><Plus size={16} /> New organization</Button>
            ) : null
          }
        />

        {list.isLoading && <SkeletonTable rows={4} cols={3} />}
        {list.data && rows.length === 0 && (
          <EmptyState icon={Building2} title="No organizations" description="Create the first organization." />
        )}

        {rows.length > 0 && (
          <DataTable
            keyOf={(r) => r.id}
            rows={rows}
            columns={[
              {
                key: 'name', header: 'Organization',
                render: (r) => (
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.name}</p>
                    <p className="text-xs text-ink-500 truncate">{r.slug}</p>
                  </div>
                ),
              },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
              { key: 'email', header: 'Contact', render: (r) => r.contactEmail || '—' },
              {
                key: 'actions', header: '',
                render: (r) => (
                  <div className="flex items-center gap-1 justify-end">
                    {canUpdate && (
                      <Button variant="ghost" className="!p-2" aria-label="Edit" onClick={() => setEditing(r)}>
                        <Pencil size={16} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" className="!p-2" aria-label="Delete" onClick={() => handleDelete(r)}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      <OrgFormModal
        open={openCreate}
        title="Create organization"
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => create.mutate(payload, { onSuccess: () => setOpenCreate(false) })}
        loading={create.isPending}
      />

      <OrgFormModal
        open={!!editing}
        title="Edit organization"
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) })}
        loading={update.isPending}
      />
    </div>
  );
}

function OrgFormModal({ open, title, initial, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', slug: '', contactEmail: '', contactPhone: '', address: '' },
  });

  useEffect(() => {
    if (open) reset({
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      contactEmail: initial?.contactEmail ?? '',
      contactPhone: initial?.contactPhone ?? '',
      address: initial?.address ?? '',
    });
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={loading}>Save</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Slug"
          error={errors.slug?.message}
          {...register('slug', { required: 'Slug is required' })}
        />
        <Input label="Contact email" type="email" {...register('contactEmail')} />
        <Input label="Contact phone" {...register('contactPhone')} />
        <Input label="Address" {...register('address')} />
      </form>
    </Modal>
  );
}
