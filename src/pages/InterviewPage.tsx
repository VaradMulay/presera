import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { InterviewQuestionCard } from '@/components/InterviewQuestionCard';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { getInterview, saveInterview } from '@/lib/storage';
import { evaluateInterviewAnswer, generateInterviewEvaluation } from '@/lib/aiService';
import type { AnswerRecord, InterviewSession } from '@/lib/types';

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const { fullUser } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const s = await getInterview(id);
      if (!active) return;
      if (!s) {
        setError('Interview not found.');
        setLoading(false);
        return;
      }
      if (s.userId !== fullUser?.id) {
        setError('This interview does not belong to you.');
        setLoading(false);
        return;
      }
      if (s.completedAt) {
        navigate(`/results/${s.id}`, { replace: true });
        return;
      }
      setSession(s);
      setCurrent(s.answers.length);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id, fullUser?.id, navigate]);

  const handleSubmit = async (skip = false) => {
    if (!session) return;
    const question = session.questions[current];
    if (!question) return;

    setSubmitting(true);
    const finalAnswer = skip ? '' : answer.trim();
    const scores = await evaluateInterviewAnswer({
      question,
      answer: finalAnswer,
      role: session.role,
      experience: session.experience,
      interviewType: session.type,
      difficulty: session.difficulty,
      jobDescription: session.jobDescription,
    });

    const record: AnswerRecord = {
      questionId: question.id,
      question: question.text,
      category: question.category,
      answer: finalAnswer,
      scores,
    };

    const updated: InterviewSession = {
      ...session,
      answers: [...session.answers, record],
    };
    await saveInterview(updated);
    setSession(updated);
    setAnswer('');
    setSubmitting(false);

    const isLast = current + 1 >= session.questions.length;
    if (isLast) {
      const result = await generateInterviewEvaluation({
        session: updated,
        role: session.role,
        experience: session.experience,
        interviewType: session.type,
        difficulty: session.difficulty,
        jobDescription: session.jobDescription,
      });
      const finalSession: InterviewSession = {
        ...updated,
        completedAt: new Date().toISOString(),
        result,
      };
      await saveInterview(finalSession);
      navigate(`/results/${finalSession.id}`);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  if (loading) return <LoadingState className="min-h-[60vh]" label="Loading interview…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-500/15 border border-error-400/20">
          <AlertCircle className="h-7 w-7 text-error-400" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">{error}</h2>
        <Button to="/dashboard" className="mt-6">Back to dashboard</Button>
      </div>
    );
  }

  if (!session) return null;

  const question = session.questions[current];
  if (!question) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h2 className="text-lg font-bold text-white">No more questions.</h2>
        <Button to="/dashboard" className="mt-6">Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-brand-500/15 border border-brand-400/20 px-3 py-1 text-xs font-semibold text-brand-300 animate-glow-pulse">
            Live Session
          </span>
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight text-white">Mock Interview in Progress</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {session.role} · {session.questions.length} questions · take your time
        </p>
      </div>

      <InterviewQuestionCard
        index={current}
        total={session.questions.length}
        question={question.text}
        category={question.category}
        role={session.role}
        type={session.type}
        difficulty={session.difficulty}
        value={answer}
        onChange={setAnswer}
        onSubmit={() => handleSubmit(false)}
        onSkip={() => handleSubmit(true)}
        isLast={current === session.questions.length - 1}
        submitting={submitting}
      />

      <div className="mt-4 flex items-center justify-center">
        <Button to="/dashboard" variant="ghost" size="sm">Exit interview</Button>
      </div>
    </div>
  );
}
