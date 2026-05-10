import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ClipboardList, BookOpen, BookText, Plus, Loader2, Users } from 'lucide-react';
import Card, { CardHeader } from '@core/ui/Card';
import DataTable from '@core/ui/DataTable';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';
import Modal from '@core/ui/Modal';
import EmptyState from '@core/ui/EmptyState';
import { useTeacherSubjectViewModel } from '../viewmodels/useTeacherSubjectViewModel';
import { useQuery } from '@tanstack/react-query';
import { assignmentService } from '../services/studiesService';

const TABS = [
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'materials', label: 'Study Material', icon: BookOpen },
  { id: 'diary', label: 'Diary', icon: BookText },
];

export default function TeacherSubjectPage() {
  const { classGroupId, offeringId } = useParams();
  const [activeTab, setActiveTab] = useState('assignments');
  const [openAssignment, setOpenAssignment] = useState(false);
  const [openMaterial, setOpenMaterial] = useState(false);
  const [openDiary, setOpenDiary] = useState(false);
  const [viewSubmissionsFor, setViewSubmissionsFor] = useState(null);

  const { assignments, materials, diary, createAssignment, createMaterial, createDiary, orgId } =
    useTeacherSubjectViewModel(offeringId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to={`/teacher/class/${classGroupId}`} className="text-ink-400 hover:text-ink-700">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">Subject</h1>
      </div>

      <Card>
        {/* Tab bar */}
        <div className="border-b border-ink-200 dark:border-ink-700 flex gap-0 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === id
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'assignments' && (
          <div>
            <CardHeader
              title="Assignments"
              actions={<Button onClick={() => setOpenAssignment(true)}><Plus size={16} /> New</Button>}
            />
            {assignments.isLoading && <Loading />}
            {!assignments.isLoading && (assignments.data ?? []).length === 0 && (
              <EmptyState icon={ClipboardList} title="No assignments" />
            )}
            {(assignments.data ?? []).length > 0 && (
              <DataTable
                keyOf={(r) => r.id}
                rows={assignments.data ?? []}
                columns={[
                  { key: 'title', header: 'Title', render: (r) => r.title },
                  { key: 'location', header: 'Type', render: (r) => r.location === 'HOMEWORK' ? 'Homework' : 'Classwork' },
                  { key: 'dueAt', header: 'Due', render: (r) => r.dueAt ? new Date(r.dueAt).toLocaleDateString() : '—' },
                  { key: 'maxMarks', header: 'Marks', render: (r) => r.maxMarks ?? '—' },
                  {
                    key: 'actions', header: '',
                    render: (r) => (
                      <Button variant="ghost" className="!p-2 text-xs" onClick={() => setViewSubmissionsFor(r.id)}>
                        <Users size={14} /> Submissions
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <CardHeader
              title="Study Materials"
              actions={<Button onClick={() => setOpenMaterial(true)}><Plus size={16} /> Post</Button>}
            />
            {materials.isLoading && <Loading />}
            {!materials.isLoading && (materials.data ?? []).length === 0 && (
              <EmptyState icon={BookOpen} title="No materials posted" />
            )}
            {(materials.data ?? []).length > 0 && (
              <DataTable
                keyOf={(r) => r.id}
                rows={materials.data ?? []}
                columns={[
                  { key: 'title', header: 'Title', render: (r) => r.title },
                  { key: 'type', header: 'Type', render: (r) => r.type },
                  {
                    key: 'url', header: 'Content',
                    render: (r) => r.type === 'LINK'
                      ? <a href={r.urlOrText} target="_blank" rel="noreferrer" className="text-primary-600 underline text-xs truncate max-w-[200px] block">{r.urlOrText}</a>
                      : <span className="text-xs text-ink-400 truncate max-w-[200px] block">{r.urlOrText ?? '—'}</span>,
                  },
                ]}
              />
            )}
          </div>
        )}

        {activeTab === 'diary' && (
          <div>
            <CardHeader
              title="Class Diary"
              actions={<Button onClick={() => setOpenDiary(true)}><Plus size={16} /> Entry</Button>}
            />
            {diary.isLoading && <Loading />}
            {!diary.isLoading && (diary.data ?? []).length === 0 && (
              <EmptyState icon={BookText} title="No diary entries" />
            )}
            {(diary.data ?? []).length > 0 && (
              <DataTable
                keyOf={(r) => r.id}
                rows={diary.data ?? []}
                columns={[
                  { key: 'date', header: 'Date', render: (r) => new Date(r.entryDate).toLocaleDateString() },
                  { key: 'topics', header: 'Topics covered', render: (r) => r.topicsCovered ?? '—' },
                  { key: 'homework', header: 'Homework', render: (r) => r.homeworkNote ?? '—' },
                ]}
              />
            )}
          </div>
        )}
      </Card>

      <CreateAssignmentModal
        open={openAssignment}
        onClose={() => setOpenAssignment(false)}
        onSubmit={(p) => createAssignment.mutate(p, { onSuccess: () => setOpenAssignment(false) })}
        loading={createAssignment.isPending}
      />
      <CreateMaterialModal
        open={openMaterial}
        onClose={() => setOpenMaterial(false)}
        onSubmit={(p) => createMaterial.mutate(p, { onSuccess: () => setOpenMaterial(false) })}
        loading={createMaterial.isPending}
      />
      <CreateDiaryModal
        open={openDiary}
        onClose={() => setOpenDiary(false)}
        onSubmit={(p) => createDiary.mutate(p, { onSuccess: () => setOpenDiary(false) })}
        loading={createDiary.isPending}
      />
      <SubmissionsModal
        assignmentId={viewSubmissionsFor}
        onClose={() => setViewSubmissionsFor(null)}
      />
    </div>
  );
}

function CreateAssignmentModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ title: '', description: '', location: 'CLASSWORK', dueAt: '', maxMarks: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal open={open} onClose={onClose} title="New assignment"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Create</Button></>}
    >
      <form className="space-y-4">
        <Input label="Title" required value={form.title} onChange={set('title')} />
        <Input label="Description (optional)" value={form.description} onChange={set('description')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Type</span>
          <select className="input" value={form.location} onChange={set('location')}>
            <option value="CLASSWORK">Classwork</option>
            <option value="HOMEWORK">Homework</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Due date (optional)" type="datetime-local" value={form.dueAt} onChange={set('dueAt')} />
          <Input label="Max marks (optional)" type="number" value={form.maxMarks} onChange={set('maxMarks')} />
        </div>
      </form>
    </Modal>
  );
}

function CreateMaterialModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ title: '', type: 'LINK', urlOrText: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal open={open} onClose={onClose} title="Post study material"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Post</Button></>}
    >
      <form className="space-y-4">
        <Input label="Title" required value={form.title} onChange={set('title')} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Type</span>
          <select className="input" value={form.type} onChange={set('type')}>
            <option value="LINK">Link</option>
            <option value="FILE">File</option>
            <option value="TEXT">Text</option>
          </select>
        </label>
        <Input label={form.type === 'TEXT' ? 'Content' : 'URL'} value={form.urlOrText} onChange={set('urlOrText')} />
      </form>
    </Modal>
  );
}

function CreateDiaryModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ entryDate: '', topicsCovered: '', summary: '', homeworkNote: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal open={open} onClose={onClose} title="New diary entry"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(form)} loading={loading}>Save</Button></>}
    >
      <form className="space-y-4">
        <Input label="Date" type="date" required value={form.entryDate} onChange={set('entryDate')} />
        <Input label="Topics covered" value={form.topicsCovered} onChange={set('topicsCovered')} />
        <Input label="Summary" value={form.summary} onChange={set('summary')} />
        <Input label="Homework note (optional)" value={form.homeworkNote} onChange={set('homeworkNote')} />
      </form>
    </Modal>
  );
}

function SubmissionsModal({ assignmentId, onClose }) {
  const submissions = useQuery({
    queryKey: ['studies', 'submissions', assignmentId],
    queryFn: () => assignmentService.submissions(assignmentId),
    enabled: !!assignmentId,
  });

  return (
    <Modal open={!!assignmentId} onClose={onClose} title="Submissions"
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      {submissions.isLoading && <Loading />}
      {(submissions.data ?? []).length === 0 && !submissions.isLoading && (
        <p className="text-sm text-ink-400 py-4 text-center">No submissions yet.</p>
      )}
      {(submissions.data ?? []).length > 0 && (
        <DataTable
          keyOf={(r) => r.id}
          rows={submissions.data ?? []}
          columns={[
            { key: 'student', header: 'Student', render: (r) => `${r.student?.firstName ?? ''} ${r.student?.lastName ?? ''}`.trim() || r.student?.email },
            { key: 'submittedAt', header: 'Submitted', render: (r) => r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—' },
            { key: 'marks', header: 'Marks', render: (r) => r.marks ?? '—' },
          ]}
        />
      )}
    </Modal>
  );
}

function Loading() {
  return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ink-400" size={22} /></div>;
}
