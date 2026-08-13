// Frontend caller for the AI proxy edge function.
//
// This module is the ONLY code in the frontend that communicates with the
// edge function. It sends the user's Supabase auth token in the
// Authorization header so the edge function can verify identity.
//
// If the edge function is not deployed, returns a network error, or responds
// with 501 (AI_NOT_CONFIGURED), the caller signals that the frontend should
// fall back to local logic. No AI provider is ever contacted directly from
// the browser.

import { supabase } from './supabase';
import type {
  Question,
  AnswerRecord,
  InterviewResult,
  Difficulty,
  ExperienceLevel,
  InterviewType,
  InterviewSession,
  Role,
  SubScore,
} from './types';

/**
 * Rich per-answer evaluation returned by the edge function.
 * The 4 sub-scores match the existing SubScore interface; the additional
 * fields (summary, strengths, improvements, idealAnswer) are available for
 * future UI enhancement but are not required by the current interview flow.
 */
export interface AnswerEvaluation extends SubScore {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

const AI_PROXY_SLUG = 'ai-proxy';

function getFunctionUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  return `${url}/functions/v1/${AI_PROXY_SLUG}`;
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Result wrapper: either the AI-produced data, or a signal to fall back.
 * `fellBack: true` means the edge function was unavailable, not configured,
 * or returned an error — the caller should use local logic.
 */
interface EdgeFunctionResult<T> {
  data: T | null;
  fellBack: boolean;
}

async function callEdgeFunction(
  action: string,
  payload: Record<string, unknown>,
): Promise<EdgeFunctionResult<unknown>> {
  const token = await getAuthToken();
  if (!token) {
    return { data: null, fellBack: true };
  }

  let response: Response;
  try {
    response = await fetch(getFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    // Network error — function not deployed or unreachable.
    return { data: null, fellBack: true };
  }

  if (response.status === 501) {
    // AI_NOT_CONFIGURED — fall back to local.
    return { data: null, fellBack: true };
  }

  if (!response.ok) {
    return { data: null, fellBack: true };
  }

  const json = await response.json();
  return { data: json.data ?? null, fellBack: false };
}

// ---------------------------------------------------------------------------
// Public API — one function per action. Each returns null when the edge
// function is unavailable, signaling aiService.ts to use local fallback.
// ---------------------------------------------------------------------------

export async function edgeGenerateQuestions(input: {
  role: Role;
  experience: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  numberOfQuestions: number;
  jobDescription?: string;
  resumeText?: string;
}): Promise<Question[] | null> {
  const result = await callEdgeFunction('generateQuestions', input);
  if (result.fellBack || !result.data) return null;
  return result.data as Question[];
}

export async function edgeEvaluateAnswer(input: {
  questionText: string;
  questionCategory: string;
  idealKeywords: string[];
  answer: string;
  role: Role;
  experience: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  jobDescription?: string;
}): Promise<AnswerEvaluation | null> {
  const result = await callEdgeFunction('evaluateAnswer', input);
  if (result.fellBack || !result.data) return null;
  return result.data as AnswerEvaluation;
}

export async function edgeGenerateEvaluation(input: {
  session: InterviewSession;
  role: Role;
  experience: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  jobDescription?: string;
  resumeText?: string;
}): Promise<InterviewResult | null> {
  const result = await callEdgeFunction('generateEvaluation', input);
  if (result.fellBack || !result.data) return null;
  return result.data as InterviewResult;
}
