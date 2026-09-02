// Supabase-backed persistence layer for the normalized schema.
// Interviews are stored across 4 tables: interviews, questions, answers,
// evaluations. This module decomposes/reconstructs the InterviewSession
// aggregate so callers work with a single object.

import { supabase } from './supabase';
import { selectQuestions } from './selectQuestions';
import { generateInterviewQuestions } from './aiService';
import type {
  AnswerRecord,
  InterviewResult,
  InterviewSession,
  InterviewType,
  OnboardingProfile,
  Question,
  QuestionCategory,
  Role,
  ExperienceLevel,
  Difficulty,
  User,
} from './types';

/* ---------- DB row types ---------- */

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  target_role: string | null;
  experience_level: string | null;
  preferred_interview_type: string | null;
  created_at: string;
}

interface InterviewRow {
  id: string;
  user_id: string;
  target_role: string | null;
  experience_level: string | null;
  interview_type: string | null;
  difficulty: string | null;
  number_of_questions: number | null;
  job_description: string | null;
  resume_name: string | null;
  resume_id: string | null;
  status: string | null;
  overall_score: number | null;
  started_at: string | null;
  completed_at: string | null;
}

interface QuestionRow {
  id: string;
  interview_id: string;
  question_number: number;
  question_text: string;
  question_type: string | null;
  ideal_keywords: string[] | null;
}

interface AnswerRow {
  id: string;
  interview_id: string;
  question_id: string;
  answer_text: string | null;
  scores: { technical: number; communication: number; problemSolving: number; relevance: number } | null;
}

interface EvaluationRow {
  id: string;
  interview_id: string;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  relevance_score: number | null;
  overall_score: number | null;
  strengths: string | null;
  weaknesses: string | null;
  feedback: string | null;
  improved_answers: string | null;
  recommendations: string | null;
}

/* ---------- Profile ---------- */

export async function getProfile(userId: string): Promise<{
  user: User;
  onboarded: boolean;
  onboarding: OnboardingProfile | null;
} | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getProfile error:', error.message);
    return null;
  }
  if (!data) return null;

  const row = data as ProfileRow;
  const onboarding: OnboardingProfile | null =
    row.target_role && row.experience_level && row.preferred_interview_type
      ? {
          role: row.target_role as Role,
          experience: row.experience_level as ExperienceLevel,
          interviewType: row.preferred_interview_type as InterviewType,
        }
      : null;

  return {
    user: {
      id: row.user_id,
      name: row.full_name ?? 'User',
      email: row.email ?? '',
      createdAt: row.created_at,
    },
    onboarded: onboarding !== null,
    onboarding,
  };
}

export async function createProfile(
  userId: string,
  name: string,
  email?: string,
): Promise<boolean> {
  const { error } = await supabase.from('profiles').insert({
    user_id: userId,
    full_name: name,
    email: email ?? null,
  });

  if (error) {
    if (error.code === '23505') return true; // already exists
    console.error('createProfile error:', error.message);
    return false;
  }
  return true;
}

export async function updateProfileName(
  userId: string,
  name: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: name })
    .eq('user_id', userId);

  if (error) {
    console.error('updateProfileName error:', error.message);
    return false;
  }
  return true;
}

export async function saveOnboarding(
  userId: string,
  profile: OnboardingProfile,
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      target_role: profile.role,
      experience_level: profile.experience,
      preferred_interview_type: profile.interviewType,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('saveOnboarding error:', error.message);
    return false;
  }
  return true;
}

/* ---------- Interviews ---------- */

function rowToSession(
  interview: InterviewRow,
  questions: QuestionRow[],
  answers: AnswerRow[],
  evaluation: EvaluationRow | null,
): InterviewSession {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const answerRecords: AnswerRecord[] = answers.map((a) => {
    const q = questionMap.get(a.question_id);
    return {
      questionId: a.question_id,
      question: q?.question_text ?? '',
      category: (q?.question_type ?? 'Technical') as QuestionCategory,
      answer: a.answer_text ?? '',
      scores: a.scores ?? { technical: 0, communication: 0, problemSolving: 0, relevance: 0 },
    };
  });

  const questionList: Question[] = questions.map((q) => ({
    id: q.id,
    role: (interview.target_role ?? 'Other') as Role,
    category: (q.question_type ?? 'Technical') as QuestionCategory,
    text: q.question_text,
    idealKeywords: q.ideal_keywords ?? [],
  }));

  const result: InterviewResult | undefined = evaluation
    ? {
        overall: evaluation.overall_score ?? 0,
        technical: evaluation.technical_score ?? 0,
        communication: evaluation.communication_score ?? 0,
        problemSolving: evaluation.problem_solving_score ?? 0,
        relevance: evaluation.relevance_score ?? 0,
        strengths: evaluation.strengths ? parseJsonArray(evaluation.strengths) : [],
        improvements: evaluation.weaknesses ? parseJsonArray(evaluation.weaknesses) : [],
        feedback: evaluation.feedback ?? '',
        recommended: evaluation.recommendations ? parseJsonArray(evaluation.recommendations) : [],
      }
    : undefined;

  return {
    id: interview.id,
    userId: interview.user_id,
    role: (interview.target_role ?? 'Other') as Role,
    experience: (interview.experience_level ?? 'Fresher') as ExperienceLevel,
    type: (interview.interview_type ?? 'Mixed') as InterviewType,
    difficulty: (interview.difficulty ?? 'Medium') as Difficulty,
    questionCount: interview.number_of_questions ?? questionList.length,
    jobDescription: interview.job_description ?? undefined,
    resumeName: interview.resume_name ?? undefined,
    resumeId: interview.resume_id ?? undefined,
    startedAt: interview.started_at ?? new Date().toISOString(),
    completedAt: interview.completed_at ?? undefined,
    questions: questionList,
    answers: answerRecords,
    result,
  };
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
}

function stringifyArray(arr: string[]): string {
  return JSON.stringify(arr);
}

export async function createInterview(
  userId: string,
  config: {
    role: Role;
    experience: ExperienceLevel;
    type: InterviewType;
    difficulty: Difficulty;
    questionCount: number;
    jobDescription?: string;
    resumeName?: string;
    resumeId?: string;
    resumeText?: string;
  },
): Promise<{ id: string; questions: Question[] } | { error: string }> {
  // Try AI-generated questions first; fall back to the local question bank.
  let questions: Question[] = [];
  try {
    questions = await generateInterviewQuestions({
      role: config.role,
      experience: config.experience,
      interviewType: config.type,
      difficulty: config.difficulty,
      numberOfQuestions: config.questionCount,
      jobDescription: config.jobDescription,
      resumeText: config.resumeText,
    });
  } catch {
    // Fall through to local selection.
  }
  if (!questions || questions.length === 0) {
    questions = selectQuestions(config.role, config.type, config.questionCount);
  }

  const { data, error } = await supabase
    .from('interviews')
    .insert({
      user_id: userId,
      target_role: config.role,
      experience_level: config.experience,
      interview_type: config.type,
      difficulty: config.difficulty,
      number_of_questions: questions.length,
      job_description: config.jobDescription?.trim() || null,
      resume_name: config.resumeName ?? null,
      resume_id: config.resumeId ?? null,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('createInterview: insert interview error:', error.message);
    return { error: error.message };
  }

  const interviewId = data.id;

  const questionRows = questions.map((q, i) => ({
    interview_id: interviewId,
    question_number: i + 1,
    question_text: q.text,
    question_type: q.category,
    ideal_keywords: q.idealKeywords,
  }));

  const { error: qError } = await supabase.from('questions').insert(questionRows);
  if (qError) {
    console.error('createInterview: insert questions error:', qError.message);
    return { error: qError.message };
  }

  return { id: interviewId, questions };
}

export async function getInterviews(userId: string): Promise<InterviewSession[] | null> {
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getInterviews error:', error.message);
    return null;
  }
  if (!interviews || interviews.length === 0) return [];

  const interviewIds = interviews.map((i) => i.id);

  const [{ data: questions }, { data: answers }, { data: evaluations }] = await Promise.all([
    supabase.from('questions').select('*').in('interview_id', interviewIds),
    supabase.from('answers').select('*').in('interview_id', interviewIds),
    supabase.from('evaluations').select('*').in('interview_id', interviewIds),
  ]);

  return interviews.map((iv) => {
    const ivRow = iv as InterviewRow;
    const ivQuestions = (questions ?? []).filter((q) => q.interview_id === iv.id) as QuestionRow[];
    const ivAnswers = (answers ?? []).filter((a) => a.interview_id === iv.id) as AnswerRow[];
    const ivEval = ((evaluations ?? []).find((e) => e.interview_id === iv.id) as EvaluationRow) ?? null;
    return rowToSession(ivRow, ivQuestions, ivAnswers, ivEval);
  });
}

export async function getInterview(id: string): Promise<InterviewSession | null> {
  const { data: interview, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('getInterview error:', error.message);
    return null;
  }
  if (!interview) return null;

  const ivRow = interview as InterviewRow;

  const [{ data: questions }, { data: answers }, { data: evaluations }] = await Promise.all([
    supabase.from('questions').select('*').eq('interview_id', id),
    supabase.from('answers').select('*').eq('interview_id', id),
    supabase.from('evaluations').select('*').eq('interview_id', id).maybeSingle(),
  ]);

  const ivQuestions = (questions ?? []) as QuestionRow[];
  const ivAnswers = (answers ?? []) as AnswerRow[];
  const ivEval = (evaluations as EvaluationRow | null) ?? null;

  return rowToSession(ivRow, ivQuestions, ivAnswers, ivEval);
}

export async function saveInterview(session: InterviewSession): Promise<boolean> {
  // Upsert the interview row.
  const interviewRow = {
    id: session.id,
    user_id: session.userId,
    target_role: session.role,
    experience_level: session.experience,
    interview_type: session.type,
    difficulty: session.difficulty,
    number_of_questions: session.questionCount,
    job_description: session.jobDescription ?? null,
    resume_name: session.resumeName ?? null,
    status: session.completedAt ? 'completed' : 'in_progress',
    overall_score: session.result?.overall ?? null,
    started_at: session.startedAt,
    completed_at: session.completedAt ?? null,
  };

  const { error: ivError } = await supabase.from('interviews').upsert(interviewRow);
  if (ivError) {
    console.error('saveInterview: upsert interview error:', ivError.message);
    return false;
  }

  // Upsert questions.
  for (const q of session.questions) {
    const qRow = {
      id: q.id,
      interview_id: session.id,
      question_number: session.questions.indexOf(q) + 1,
      question_text: q.text,
      question_type: q.category,
      ideal_keywords: q.idealKeywords,
    };
    const { error: qError } = await supabase.from('questions').upsert(qRow);
    if (qError) {
      console.error('saveInterview: upsert question error:', qError.message);
    }
  }

  // Upsert answers.
  for (const a of session.answers) {
    const aRow = {
      interview_id: session.id,
      question_id: a.questionId,
      answer_text: a.answer,
      scores: a.scores,
    };
    const { error: aError } = await supabase
      .from('answers')
      .upsert(aRow, { onConflict: 'interview_id,question_id' });
    if (aError) {
      console.error('saveInterview: upsert answer error:', aError.message);
    }
  }

  // Upsert evaluation if result exists.
  if (session.result) {
    const eRow = {
      interview_id: session.id,
      technical_score: session.result.technical,
      communication_score: session.result.communication,
      problem_solving_score: session.result.problemSolving,
      relevance_score: session.result.relevance,
      overall_score: session.result.overall,
      strengths: stringifyArray(session.result.strengths),
      weaknesses: stringifyArray(session.result.improvements),
      feedback: session.result.feedback,
      improved_answers: null,
      recommendations: stringifyArray(session.result.recommended),
    };
    const { error: eError } = await supabase.from('evaluations').upsert(eRow);
    if (eError) {
      console.error('saveInterview: upsert evaluation error:', eError.message);
    }
  }

  return true;
}
