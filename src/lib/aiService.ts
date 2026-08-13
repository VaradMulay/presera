// AI service abstraction layer.
//
// This module is the single switch point between local heuristic logic and
// a real AI provider. The flow is:
//
//   1. Try the Supabase Edge Function (ai-proxy) which will call the AI
//      provider server-side.
//   2. If the edge function is unavailable, not configured, or errors,
//      fall back to the local implementations (selectQuestions, scoreAnswer,
//      computeResult).
//
// The interview UI and database structure never change — they always call
// these three functions regardless of whether AI is connected.

import { selectQuestions } from './selectQuestions';
import { scoreAnswer, computeResult } from './scoring';
import {
  edgeGenerateQuestions,
  edgeEvaluateAnswer,
  edgeGenerateEvaluation,
} from './aiEdgeFunction';
import type {
  AnswerRecord,
  Difficulty,
  ExperienceLevel,
  InterviewResult,
  InterviewSession,
  InterviewType,
  Question,
  Role,
} from './types';

export interface GenerateQuestionsInput {
  role: Role;
  experience: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  numberOfQuestions: number;
  jobDescription?: string;
  resumeText?: string;
}

export interface EvaluateAnswerInput {
  question: Question;
  answer: string;
  role: Role;
  experience: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  jobDescription?: string;
}

export interface GenerateEvaluationInput {
  session: InterviewSession;
  role: Role;
  experience: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  jobDescription?: string;
  resumeText?: string;
}

export async function generateInterviewQuestions(
  input: GenerateQuestionsInput,
): Promise<Question[]> {
  try {
    const aiResult = await edgeGenerateQuestions(input);
    if (aiResult && aiResult.length > 0) return aiResult;
  } catch {
    // Fall through to local logic.
  }
  return selectQuestions(input.role, input.interviewType, input.numberOfQuestions);
}

export async function evaluateInterviewAnswer(
  input: EvaluateAnswerInput,
): Promise<AnswerRecord['scores']> {
  try {
    const aiResult = await edgeEvaluateAnswer({
      questionText: input.question.text,
      questionCategory: input.question.category,
      idealKeywords: input.question.idealKeywords,
      answer: input.answer,
      role: input.role,
      experience: input.experience,
      interviewType: input.interviewType,
      difficulty: input.difficulty,
      jobDescription: input.jobDescription,
    });
    if (aiResult) {
      return {
        technical: aiResult.technical,
        communication: aiResult.communication,
        problemSolving: aiResult.problemSolving,
        relevance: aiResult.relevance,
      };
    }
  } catch {
    // Fall through to local logic.
  }
  return scoreAnswer(input.answer, input.question.idealKeywords, input.question.category);
}

export async function generateInterviewEvaluation(
  input: GenerateEvaluationInput,
): Promise<InterviewResult> {
  try {
    const aiResult = await edgeGenerateEvaluation(input);
    if (aiResult) return aiResult;
  } catch {
    // Fall through to local logic.
  }
  return computeResult(input.session);
}
