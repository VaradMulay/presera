import { Clock, Tag } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { Card } from './Card';
import type { InterviewType, Difficulty } from '@/lib/types';

interface InterviewQuestionCardProps {
  index: number;
  total: number;
  question: string;
  category: string;
  role: string;
  type: InterviewType;
  difficulty: Difficulty;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  isLast: boolean;
  submitting?: boolean;
}

export function InterviewQuestionCard({
  index,
  total,
  question,
  category,
  role,
  type,
  difficulty,
  value,
  onChange,
  onSubmit,
  onSkip,
  isLast,
  submitting,
}: InterviewQuestionCardProps) {
  const progress = ((index + 1) / total) * 100;

  return (
    <Card className="animate-fade-in" padded={false}>
      <div className="border-b border-neutral-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Tag className="h-3 w-3" /> {role}
            </span>
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              {type}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                difficulty === 'Hard'
                  ? 'bg-error-50 text-error-700'
                  : difficulty === 'Medium'
                    ? 'bg-warning-50 text-warning-700'
                    : 'bg-success-50 text-success-700'
              }`}
            >
              {difficulty}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <Clock className="h-3.5 w-3.5" /> {category}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="font-semibold text-neutral-900">
            Question {index + 1} of {total}
          </span>
          <span className="text-neutral-500">{Math.round(progress)}% complete</span>
        </div>
        <ProgressBar value={progress} className="mt-2" size="md" />
      </div>

      <div className="p-6">
        <p className="text-lg font-semibold leading-relaxed text-neutral-900">{question}</p>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder="Type your answer here. Take your time — structure your response clearly…"
          className="mt-5 w-full resize-y rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          autoFocus
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {value.trim().split(/\s+/).filter(Boolean).length} words
          </p>
          <div className="flex items-center gap-3">
            {onSkip && !isLast && (
              <Button variant="ghost" onClick={onSkip} disabled={submitting}>
                Skip
              </Button>
            )}
            <Button onClick={onSubmit} disabled={submitting || value.trim().length === 0}>
              {submitting ? 'Saving…' : isLast ? 'Submit & Finish' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
