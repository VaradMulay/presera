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
    <Card className="animate-tilt-in" padded={false}>
      <div className="border-b border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 border border-brand-400/20 px-3 py-1 text-xs font-semibold text-brand-300">
              <Tag className="h-3 w-3" /> {role}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-300">
              {type}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                difficulty === 'Hard'
                  ? 'bg-error-500/15 text-error-300 border-error-400/20'
                  : difficulty === 'Medium'
                    ? 'bg-warning-500/15 text-warning-300 border-warning-400/20'
                    : 'bg-success-500/15 text-success-300 border-success-400/20'
              }`}
            >
              {difficulty}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock className="h-3.5 w-3.5" /> {category}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="font-semibold text-white">
            Question {index + 1} of {total}
          </span>
          <span className="text-slate-400">{Math.round(progress)}% complete</span>
        </div>
        <ProgressBar value={progress} className="mt-2" size="md" />
      </div>

      <div className="p-6">
        <p className="min-w-0 flex-1 break-words whitespace-normal text-lg font-semibold leading-relaxed text-white">{question}</p>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder="Type your answer here. Take your time — structure your response clearly…"
          className="mt-5 w-full resize-y rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 text-sm leading-relaxed text-white placeholder:text-slate-500 transition focus:border-brand-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          autoFocus
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
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
