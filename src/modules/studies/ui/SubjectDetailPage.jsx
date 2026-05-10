import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ClipboardList, BookOpen, BookText, FileText, BrainCircuit, Loader2, Plus, Save } from 'lucide-react';
import { useSubjectDetailViewModel } from '../viewmodels/useSubjectDetailViewModel';
import Button from '@core/ui/Button';

const TABS = [
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'materials', label: 'Study Material', icon: BookOpen },
  { id: 'diary', label: 'Diary', icon: BookText },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'mock-test', label: 'Mock Test', icon: BrainCircuit },
];

export default function SubjectDetailPage() {
  const { offeringId } = useParams();
  const [activeTab, setActiveTab] = useState('assignments');
  const { assignments, materials, diary, note, submitAssignment, saveNote, userId } = useSubjectDetailViewModel(offeringId);
  const [noteBody, setNoteBody] = useState('');
  const [noteInitialized, setNoteInitialized] = useState(false);

  if (note.data && !noteInitialized) {
    setNoteBody(note.data?.body ?? '');
    setNoteInitialized(true);
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-screen">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link to="/workspace" className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold text-ink-900 dark:text-ink-100 truncate">Subject</h1>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 bg-surface border-b border-ink-200 dark:border-ink-700 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === id
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {activeTab === 'assignments' && (
          <AssignmentsTab assignments={assignments} submitAssignment={submitAssignment} studentUserId={userId} offeringId={offeringId} />
        )}
        {activeTab === 'materials' && <MaterialsTab materials={materials} />}
        {activeTab === 'diary' && <DiaryTab diary={diary} />}
        {activeTab === 'notes' && (
          <NotesTab noteBody={noteBody} onChange={setNoteBody} onSave={() => saveNote.mutate(noteBody)} saving={saveNote.isPending} />
        )}
        {activeTab === 'mock-test' && (
          <div className="space-y-3">
            <Link to={`/workspace/subject/${offeringId}/mock-test/new`}>
              <Button className="w-full"><Plus size={16} /> Generate mock test</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentsTab({ assignments, submitAssignment, studentUserId, offeringId }) {
  if (assignments.isLoading) return <Loader />;
  const items = assignments.data ?? [];
  if (items.length === 0) return <Empty icon={ClipboardList} label="No assignments yet" />;
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="rounded-xl border border-ink-200 dark:border-ink-700 p-4 bg-surface space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-ink-900 dark:text-ink-100">{a.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
              a.location === 'HOMEWORK'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              {a.location === 'HOMEWORK' ? 'Homework' : 'Classwork'}
            </span>
          </div>
          {a.description && <p className="text-xs text-ink-500">{a.description}</p>}
          {a.dueAt && <p className="text-xs text-ink-400">Due: {new Date(a.dueAt).toLocaleDateString()}</p>}
          {a.maxMarks && <p className="text-xs text-ink-400">Marks: {a.maxMarks}</p>}
          <Button
            variant="outline"
            className="w-full mt-2 text-xs !py-1.5"
            onClick={() => submitAssignment.mutate({ assignmentId: a.id, payload: { content: '' } })}
            loading={submitAssignment.isPending}
          >
            Mark as done
          </Button>
        </div>
      ))}
    </div>
  );
}

function MaterialsTab({ materials }) {
  if (materials.isLoading) return <Loader />;
  const items = materials.data ?? [];
  if (items.length === 0) return <Empty icon={BookOpen} label="No study materials yet" />;
  return (
    <div className="space-y-3">
      {items.map((m) => (
        <div key={m.id} className="rounded-xl border border-ink-200 dark:border-ink-700 p-4 bg-surface space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-700 text-ink-500">{m.type}</span>
            <p className="font-medium text-sm text-ink-900 dark:text-ink-100 truncate">{m.title}</p>
          </div>
          {m.type === 'LINK' && m.urlOrText && (
            <a href={m.urlOrText} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 underline break-all">
              {m.urlOrText}
            </a>
          )}
          {m.type === 'TEXT' && m.urlOrText && (
            <p className="text-xs text-ink-500 line-clamp-3">{m.urlOrText}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function DiaryTab({ diary }) {
  if (diary.isLoading) return <Loader />;
  const items = diary.data ?? [];
  if (items.length === 0) return <Empty icon={BookText} label="No diary entries yet" />;
  return (
    <div className="space-y-3">
      {items.map((d) => (
        <div key={d.id} className="rounded-xl border border-ink-200 dark:border-ink-700 p-4 bg-surface space-y-1.5">
          <p className="text-xs font-semibold text-ink-400">{new Date(d.entryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
          {d.topicsCovered && <p className="text-sm text-ink-900 dark:text-ink-100"><span className="font-medium">Topics:</span> {d.topicsCovered}</p>}
          {d.summary && <p className="text-sm text-ink-500">{d.summary}</p>}
          {d.homeworkNote && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mt-1">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Homework</p>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">{d.homeworkNote}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function NotesTab({ noteBody, onChange, onSave, saving }) {
  return (
    <div className="space-y-3">
      <textarea
        className="w-full min-h-[280px] rounded-xl border border-ink-200 dark:border-ink-700 bg-surface p-4 text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="Your personal notes for this subject…"
        value={noteBody}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button className="w-full" onClick={onSave} loading={saving}>
        <Save size={16} /> Save notes
      </Button>
    </div>
  );
}

function Loader() {
  return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-ink-400" size={24} /></div>;
}

function Empty({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-ink-400">
      <Icon size={36} className="mb-2 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
