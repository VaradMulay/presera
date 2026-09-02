import { useCallback } from 'react';
import { Clock, Tag, Mic, MicOff, Square } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { Card } from './Card';
import { useToast } from '@/context/ToastContext';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';
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
  const { info, error: showError } = useToast();

  const handleTranscript = useCallback((text: string) => {
    onChange(value + text);
  }, [value, onChange]);

  const { listening, supported, error: speechError, start, stop } = useSpeechRecognition(handleTranscript);

  const toggleMic = () => {
    if (!supported) {
      showError('Voice input unavailable', 'Your browser does not support speech recognition. Try Chrome, Edge, or Safari.');
      return;
    }
    if (speechError) {
      showError('Microphone error', speechError);
    }
    if (listening) {
      stop();
    } else {
      info('Listening…', 'Speak your answer — your words will appear in the text box.');
      start(value);
    }
  };

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

        {/* Recording indicator */}
        {listening && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-error-400/20 bg-error-500/10 px-3 py-2">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 animate-glow-pulse rounded-full bg-error-400" />
              <span className="h-2 w-2 animate-glow-pulse rounded-full bg-error-400" style={{ animationDelay: '0.2s' }} />
              <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-error-400" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs font-semibold text-error-300">Listening… speak your answer</span>
          </div>
        )}

        {/* Speech error */}
        {speechError && !listening && (
          <div className="mt-3 rounded-lg border border-warning-400/20 bg-warning-500/10 px-3 py-2 text-xs text-warning-300">
            {speechError}
          </div>
        )}

        <div className="relative mt-5">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            placeholder="Type or speak your answer. Take your time — structure your response clearly…"
            className="w-full resize-y rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 pr-14 text-sm leading-relaxed text-white placeholder:text-slate-500 transition focus:border-brand-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            autoFocus
          />
          <button
            type="button"
            onClick={toggleMic}
            disabled={!supported}
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:opacity-40 ${
              listening
                ? 'border-error-400/30 bg-error-500/20 text-error-300 shadow-glow-error'
                : 'border-white/15 bg-white/10 text-slate-300 hover:border-brand-400/40 hover:bg-brand-500/15 hover:text-brand-300'
            }`}
            aria-label={listening ? 'Stop recording' : 'Start voice input'}
            title={supported ? (listening ? 'Stop recording' : 'Start voice input') : 'Voice input not supported in this browser'}
          >
            {listening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>

        {/* Mic status / unsupported notice */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {!supported && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <MicOff className="h-3.5 w-3.5" /> Voice input not supported in this browser
              </span>
            )}
            {supported && !listening && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Mic className="h-3.5 w-3.5" /> Click the mic icon to dictate your answer
              </span>
            )}
            {supported && listening && (
              <button
                type="button"
                onClick={toggleMic}
                className="flex items-center gap-1.5 font-medium text-error-400 hover:text-error-300"
              >
                <Square className="h-3 w-3 fill-current" /> Stop recording
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {value.trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div />
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
