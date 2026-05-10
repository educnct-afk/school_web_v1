import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, BrainCircuit, Sparkles } from 'lucide-react';
import { useMockTestViewModel } from '../viewmodels/useMockTestViewModel';
import Button from '@core/ui/Button';
import Input from '@core/ui/Input';

export default function MockTestGeneratePage() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const { generate } = useMockTestViewModel(offeringId);
  const [topic, setTopic] = useState('');
  const [showShimmer, setShowShimmer] = useState(false);
  const [shimmerStart, setShimmerStart] = useState(null);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setShowShimmer(true);
    setShimmerStart(Date.now());
    generate.mutate({ topic }, {
      onSuccess: (data) => {
        const elapsed = Date.now() - shimmerStart;
        const remaining = Math.max(0, 2000 - elapsed);
        setTimeout(() => {
          setShowShimmer(false);
          navigate(`/workspace/subject/${offeringId}/mock-test/${data.id}`);
        }, remaining);
      },
      onError: () => setShowShimmer(false),
    });
  };

  if (showShimmer) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <BrainCircuit size={32} className="text-primary-600 dark:text-primary-400 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-primary-300 dark:border-primary-700 animate-ping opacity-30" />
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-ink-900 dark:text-ink-100 text-lg">Generating your test…</p>
          <p className="text-sm text-ink-500">Generating questions tailored to your syllabus…</p>
        </div>
        <div className="w-full max-w-xs space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/workspace/subject/${offeringId}`} className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold text-ink-900 dark:text-ink-100">Generate Mock Test</h1>
      </div>

      <div className="rounded-2xl border border-ink-200 dark:border-ink-700 p-6 space-y-5 bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Sparkles size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-ink-900 dark:text-ink-100">AI-Powered Quiz</p>
            <p className="text-xs text-ink-400">5 questions, multiple choice</p>
          </div>
        </div>

        <Input
          label="Topic"
          placeholder="e.g. Quadratic Equations, Photosynthesis…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />

        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={!topic.trim() || generate.isPending}
          loading={generate.isPending}
        >
          <BrainCircuit size={16} />
          Generate test
        </Button>
      </div>
    </div>
  );
}
