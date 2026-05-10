import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useMockTestDetailViewModel, useMockTestViewModel } from '../viewmodels/useMockTestViewModel';
import Button from '@core/ui/Button';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function MockTestAttemptPage() {
  const { offeringId, mockTestId } = useParams();
  const navigate = useNavigate();
  const { test } = useMockTestDetailViewModel(mockTestId);
  const { submitAttempt } = useMockTestViewModel(offeringId);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  if (test.isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-ink-400" size={28} /></div>;
  }

  const questions = test.data?.questions ?? [];
  const total = questions.length;
  const q = questions[currentIdx];

  if (result) {
    return <ResultScreen result={result} questions={questions} answers={answers} offeringId={offeringId} />;
  }

  if (!q) return null;

  const options = [
    { label: 'A', text: q.optionA },
    { label: 'B', text: q.optionB },
    { label: 'C', text: q.optionC },
    { label: 'D', text: q.optionD },
  ].filter((o) => o.text);

  const selected = answers[q.id];
  const isLast = currentIdx === total - 1;
  const allAnswered = questions.every((qq) => !!answers[qq.id]);

  const handleSubmit = () => {
    submitAttempt.mutate({ mockTestId, answers }, {
      onSuccess: (data) => setResult(data),
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/workspace/subject/${offeringId}`} className="text-ink-400 hover:text-ink-700">
          <ChevronLeft size={22} />
        </Link>
        <div className="flex-1">
          <p className="text-xs text-ink-400 font-medium">{test.data?.topic}</p>
          <div className="flex gap-1 mt-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i === currentIdx ? 'bg-primary-600' : answers[questions[i]?.id] ? 'bg-primary-300' : 'bg-ink-200 dark:bg-ink-700'}`} />
            ))}
          </div>
        </div>
        <span className="text-xs text-ink-400 shrink-0">{currentIdx + 1} / {total}</span>
      </div>

      <div className="flex-1 space-y-4">
        <div className="rounded-2xl border border-ink-200 dark:border-ink-700 bg-surface p-5">
          <p className="text-sm font-medium text-ink-900 dark:text-ink-100 leading-relaxed">{q.prompt}</p>
        </div>

        <div className="space-y-2">
          {options.map(({ label, text }) => (
            <button
              key={label}
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: label }))}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left flex items-start gap-3 transition-all active:scale-98
                ${selected === label
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                  : 'border-ink-200 dark:border-ink-700 bg-surface hover:border-ink-400'}`}
            >
              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                ${selected === label ? 'border-primary-500 bg-primary-500 text-white' : 'border-ink-300 dark:border-ink-600 text-ink-400'}`}>
                {label}
              </span>
              <span className="text-sm text-ink-800 dark:text-ink-200 leading-relaxed">{text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        {currentIdx > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setCurrentIdx((i) => i - 1)}>
            <ChevronLeft size={16} /> Back
          </Button>
        )}
        {!isLast ? (
          <Button className="flex-1" onClick={() => setCurrentIdx((i) => i + 1)} disabled={!selected}>
            Next <ChevronRight size={16} />
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleSubmit} disabled={!allAnswered} loading={submitAttempt.isPending}>
            Submit test
          </Button>
        )}
      </div>
    </div>
  );
}

function ResultScreen({ result, questions, answers, offeringId }) {
  const total = questions.length;
  const score = result.score ?? 0;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="text-center space-y-2 py-4">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold ${pct >= 60 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}`}>
          {score}/{total}
        </div>
        <p className="text-xl font-bold text-ink-900 dark:text-ink-100">{pct}% correct</p>
        <p className="text-sm text-ink-500">{pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort!' : 'Keep practising!'}</p>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const given = answers[q.id];
          const correct = q.correctOption?.toUpperCase();
          const isCorrect = given?.toUpperCase() === correct;
          return (
            <div key={q.id} className="rounded-xl border border-ink-200 dark:border-ink-700 bg-surface p-4 space-y-2">
              <div className="flex items-start gap-2">
                {isCorrect
                  ? <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  : <XCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />}
                <p className="text-sm text-ink-900 dark:text-ink-100">{q.prompt}</p>
              </div>
              {!isCorrect && (
                <p className="text-xs text-ink-400">
                  Your answer: <span className="text-rose-500 font-medium">{given}</span> · Correct: <span className="text-emerald-600 font-medium">{correct}</span>
                </p>
              )}
              {q.explanation && (
                <p className="text-xs text-ink-500 border-t border-ink-100 dark:border-ink-700 pt-2 mt-1">{q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      <Link to={`/workspace/subject/${offeringId}`}>
        <Button variant="outline" className="w-full">Back to subject</Button>
      </Link>
    </div>
  );
}
