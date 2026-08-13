import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Presera AI Proxy Edge Function
//
// This is the single server-side entry point for all AI operations.
// The frontend calls this function; the function calls the AI provider;
// the result flows back. The frontend never touches an AI provider directly.
//
// Architecture:
//   Presera frontend → this Edge Function → AI provider → back to frontend
//
// Authentication:
//   Every request must include a valid Supabase access token in the
//   Authorization header. The function verifies the JWT by creating a
//   Supabase client with the caller's token and checking auth.getUser().
//   Unauthenticated requests are rejected with 401.
//
// AI secrets:
//   The Gemini API key is stored as a Supabase Edge Function secret
//   (GEMINI_API_KEY) and read via Deno.env.get("GEMINI_API_KEY").
//   It is NEVER exposed to the frontend, logged, or stored in the database.
//   No VITE_* env vars are used for AI secrets.
//
// Supported actions (POST body field "action"):
//   - "generateQuestions"   → generate interview questions (Gemini)
//   - "evaluateAnswer"      → evaluate a single answer (not yet implemented)
//   - "generateEvaluation"  → generate final interview evaluation (not yet)
//
// When an AI provider key is missing or a handler fails, the function
// returns 501 with { error: "AI_NOT_CONFIGURED" } so the frontend falls
// back to local logic.
// ---------------------------------------------------------------------------

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Type definitions matching the frontend types. Duplicated here because the
// edge function cannot import from the frontend src/ directory.
// ---------------------------------------------------------------------------

interface BasePayload {
  action: "generateQuestions" | "evaluateAnswer" | "generateEvaluation";
}

interface QuestionPayload {
  id: string;
  role: string;
  category: string;
  text: string;
  idealKeywords: string[];
}

interface SubScorePayload {
  technical: number;
  communication: number;
  problemSolving: number;
  relevance: number;
}

/** Rich per-answer evaluation returned to the frontend. */
interface AnswerEvaluationPayload extends SubScorePayload {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

interface InterviewResultPayload {
  overall: number;
  technical: number;
  communication: number;
  problemSolving: number;
  relevance: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  recommended: string[];
}

interface AnswerRecordPayload {
  questionId: string;
  question: string;
  category: string;
  answer: string;
  scores: SubScorePayload;
}

interface InterviewSessionPayload {
  id: string;
  role: string;
  experience: string;
  type: string;
  difficulty: string;
  questionCount: number;
  jobDescription?: string;
  resumeName?: string;
  startedAt: string;
  questions: QuestionPayload[];
  answers: AnswerRecordPayload[];
}

// ---------------------------------------------------------------------------
// Auth verification
// ---------------------------------------------------------------------------

async function verifyAuth(req: Request): Promise<{ user: { id: string } } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in edge function env");
    return null;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  return { user: { id: data.user.id } };
}

// ---------------------------------------------------------------------------
// AI provider key
// ---------------------------------------------------------------------------

function getGeminiApiKey(): string | null {
  return Deno.env.get("GEMINI_API_KEY") ?? null;
}

// ---------------------------------------------------------------------------
// Gemini API helpers
// ---------------------------------------------------------------------------

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    code?: number;
    message?: string;
  };
}

async function callGemini(
  prompt: string,
  apiKey: string,
): Promise<string | null> {
  const url = `${GEMINI_ENDPOINT}?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8,
          maxOutputTokens: 8192,
        },
      }),
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GeminiResponse;

  if (data.error || data.promptFeedback?.blockReason) {
    return null;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return null;
  }

  return text;
}

// ---------------------------------------------------------------------------
// Question generation handler
// ---------------------------------------------------------------------------

interface GenerateQuestionsPayload {
  role: string;
  experience: string;
  interviewType: string;
  difficulty: string;
  numberOfQuestions: number;
  jobDescription?: string;
  resumeText?: string;
}

const VALID_CATEGORIES = ["Technical", "HR", "Behavioral", "Problem Solving"] as const;
type ValidCategory = (typeof VALID_CATEGORIES)[number];

function isCategory(value: unknown): value is ValidCategory {
  return typeof value === "string" &&
    (VALID_CATEGORIES as readonly string[]).includes(value);
}

function buildQuestionPrompt(p: GenerateQuestionsPayload): string {
  const categoryGuidance =
    p.interviewType === "Mixed"
      ? "Mix Technical, Behavioral, HR, and Problem Solving questions proportionally."
      : p.interviewType === "Technical"
        ? "Focus on Technical and Problem Solving questions. You may include at most one Behavioral or HR question."
        : p.interviewType === "HR"
          ? "Focus on HR questions with at most one Behavioral question."
          : "Focus on Behavioral questions with at most one HR question.";

  const difficultyGuidance =
    p.difficulty === "Easy"
      ? "Start with straightforward, foundational questions and end at moderate difficulty."
      : p.difficulty === "Hard"
        ? "Include advanced, edge-case, and architectural questions with a smooth difficulty progression."
        : "Use a smooth progression from intermediate to moderately advanced questions.";

  const contextParts: string[] = [];
  if (p.jobDescription && p.jobDescription.trim()) {
    contextParts.push(`JOB DESCRIPTION:\n${p.jobDescription.trim()}`);
  }
  if (p.resumeText && p.resumeText.trim()) {
    contextParts.push(`CANDIDATE RESUME:\n${p.resumeText.trim()}`);
  }
  const contextBlock = contextParts.length > 0
    ? `\n\n${contextParts.join("\n\n")}\n\nTailor the questions to the job description and resume above when relevant.`
    : "";

  return `You are an expert technical interviewer for the role of "${p.role}".
The candidate has experience level: ${p.experience}.
Interview type: ${p.interviewType}.
Difficulty: ${p.difficulty}. ${difficultyGuidance}
${categoryGuidance}
${contextBlock}

Generate exactly ${p.numberOfQuestions} unique, realistic interview questions for this role and experience level.
Each question must be clear, specific, and answerable in 2-5 minutes.
Do not repeat or near-duplicate any question.
Progress difficulty smoothly from easier to harder.

Return a JSON array of exactly ${p.numberOfQuestions} objects with this shape:
{
  "id": "ai-1", "ai-2", ... "ai-${p.numberOfQuestions}" (sequential),
  "role": "${p.role}",
  "category": one of "Technical" | "HR" | "Behavioral" | "Problem Solving",
  "text": the question text,
  "idealKeywords": an array of 5-8 keywords or short phrases that a strong answer would mention
}

Return ONLY the JSON array. No markdown, no explanation.`;
}

function parseQuestions(
  raw: string,
  role: string,
  count: number,
): QuestionPayload[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const arr = Array.isArray(parsed) ? parsed : null;
  if (!arr) return null;

  const questions: QuestionPayload[] = [];
  const seenTexts = new Set<string>();

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i] as Record<string, unknown>;
    if (!item || typeof item.text !== "string" || !item.text.trim()) continue;

    const text = item.text.trim();
    const lower = text.toLowerCase();
    if (seenTexts.has(lower)) continue;
    seenTexts.add(lower);

    const category = isCategory(item.category) ? item.category : "Technical";
    const keywords = Array.isArray(item.idealKeywords)
      ? (item.idealKeywords as unknown[]).filter((k): k is string => typeof k === "string" && k.trim().length > 0)
      : [];

    const id = typeof item.id === "string" && item.id.trim()
      ? item.id.trim()
      : `ai-${questions.length + 1}`;

    questions.push({
      id,
      role,
      category,
      text,
      idealKeywords: keywords.length > 0 ? keywords : [],
    });

    if (questions.length >= count) break;
  }

  if (questions.length === 0) return null;
  return questions;
}

async function handleGenerateQuestions(
  _userId: string,
  payload: Record<string, unknown>,
): Promise<QuestionPayload[] | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const p: GenerateQuestionsPayload = {
    role: String(payload.role ?? "Other"),
    experience: String(payload.experience ?? "Fresher"),
    interviewType: String(payload.interviewType ?? "Mixed"),
    difficulty: String(payload.difficulty ?? "Medium"),
    numberOfQuestions: Number(payload.numberOfQuestions ?? 5),
    jobDescription: typeof payload.jobDescription === "string" ? payload.jobDescription : undefined,
    resumeText: typeof payload.resumeText === "string" ? payload.resumeText : undefined,
  };

  if (p.numberOfQuestions < 1 || p.numberOfQuestions > 20) return null;

  const prompt = buildQuestionPrompt(p);
  const raw = await callGemini(prompt, apiKey);
  if (!raw) return null;

  const questions = parseQuestions(raw, p.role, p.numberOfQuestions);
  return questions;
}

// ---------------------------------------------------------------------------
// Answer evaluation handler
// ---------------------------------------------------------------------------

interface EvaluateAnswerPayload {
  questionText: string;
  questionCategory: string;
  idealKeywords: string[];
  answer: string;
  role: string;
  experience: string;
  interviewType: string;
  difficulty: string;
  jobDescription?: string;
}

function clampScore(n: unknown, fallback: number): number {
  const num = typeof n === "number" ? n : typeof n === "string" ? Number(n) : NaN;
  if (Number.isNaN(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function buildEvaluatePrompt(p: EvaluateAnswerPayload): string {
  const keywordsStr = p.idealKeywords.length > 0
    ? p.idealKeywords.join(", ")
    : "(not provided)";

  const contextParts: string[] = [];
  if (p.jobDescription && p.jobDescription.trim()) {
    contextParts.push(`JOB DESCRIPTION:\n${p.jobDescription.trim()}`);
  }
  const contextBlock = contextParts.length > 0
    ? `\n\n${contextParts.join("\n\n")}\n`
    : "";

  return `You are an expert interviewer evaluating a candidate's answer for the role of "${p.role}".
Candidate experience level: ${p.experience}.
Interview type: ${p.interviewType}.
Difficulty: ${p.difficulty}.
Question category: ${p.questionCategory}.
${contextBlock}

QUESTION:
${p.questionText}

IDEAL ANSWER KEYWORDS (for reference): ${keywordsStr}

CANDIDATE'S ANSWER:
"""
${p.answer || "(no answer provided)"}
"""

Evaluate the candidate's answer. Be fair, constructive, and tailored to the role and difficulty.
If the answer is empty or extremely short, assign low scores but still provide constructive guidance.

Return a single JSON object with exactly these fields:
{
  "technical": integer 0-100 — depth of technical/subject-matter correctness,
  "communication": integer 0-100 — clarity, structure, and articulation,
  "problemSolving": integer 0-100 — logical reasoning and problem-solving approach,
  "relevance": integer 0-100 — how directly the answer addresses the question,
  "overallScore": integer 0-100 — holistic weighted score,
  "summary": a 2-3 sentence overall assessment,
  "strengths": array of 1-3 short strings noting what the candidate did well,
  "improvements": array of 1-3 short strings noting specific areas to improve,
  "idealAnswer": a concise model answer (3-6 sentences) the candidate can learn from
}

Return ONLY the JSON object. No markdown, no explanation.`;
}

function parseAnswerEvaluation(
  raw: string,
): AnswerEvaluationPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  const technical = clampScore(obj.technical, 50);
  const communication = clampScore(obj.communication, 50);
  const problemSolving = clampScore(obj.problemSolving, 50);
  const relevance = clampScore(obj.relevance, 50);
  const overallScore = clampScore(
    obj.overallScore,
    Math.round((technical + communication + problemSolving + relevance) / 4),
  );

  const summary = typeof obj.summary === "string" ? obj.summary : "";
  const idealAnswer = typeof obj.idealAnswer === "string" ? obj.idealAnswer : "";

  const strengths = Array.isArray(obj.strengths)
    ? (obj.strengths as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];
  const improvements = Array.isArray(obj.improvements)
    ? (obj.improvements as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];

  return {
    technical,
    communication,
    problemSolving,
    relevance,
    overallScore,
    summary,
    strengths,
    improvements,
    idealAnswer,
  };
}

async function handleEvaluateAnswer(
  _userId: string,
  payload: Record<string, unknown>,
): Promise<AnswerEvaluationPayload | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const p: EvaluateAnswerPayload = {
    questionText: String(payload.questionText ?? ""),
    questionCategory: String(payload.questionCategory ?? "Technical"),
    idealKeywords: Array.isArray(payload.idealKeywords)
      ? (payload.idealKeywords as unknown[]).filter((k): k is string => typeof k === "string" && k.trim().length > 0)
      : [],
    answer: String(payload.answer ?? ""),
    role: String(payload.role ?? "Other"),
    experience: String(payload.experience ?? "Fresher"),
    interviewType: String(payload.interviewType ?? "Mixed"),
    difficulty: String(payload.difficulty ?? "Medium"),
    jobDescription: typeof payload.jobDescription === "string" ? payload.jobDescription : undefined,
  };

  if (!p.questionText.trim()) return null;

  const prompt = buildEvaluatePrompt(p);
  const raw = await callGemini(prompt, apiKey);
  if (!raw) return null;

  return parseAnswerEvaluation(raw);
}

// ---------------------------------------------------------------------------
// Final evaluation handler
// ---------------------------------------------------------------------------

interface GenerateEvaluationPayload {
  session: InterviewSessionPayload;
  role: string;
  experience: string;
  interviewType: string;
  difficulty: string;
  jobDescription?: string;
  resumeText?: string;
}

function buildEvaluationPrompt(p: GenerateEvaluationPayload): string {
  const s = p.session;
  const qaBlock = s.answers.map((a, i) => {
    const sc = a.scores;
    const avg = Math.round((sc.technical + sc.communication + sc.problemSolving + sc.relevance) / 4);
    return `Q${i + 1} [${a.category}] (avg ${avg}/100):
Question: ${a.question}
Answer: ${a.answer || "(no answer provided)"}
Scores: technical=${sc.technical}, communication=${sc.communication}, problemSolving=${sc.problemSolving}, relevance=${sc.relevance}`;
  }).join("\n\n");

  const contextParts: string[] = [];
  if (p.jobDescription && p.jobDescription.trim()) {
    contextParts.push(`JOB DESCRIPTION:\n${p.jobDescription.trim()}`);
  }
  if (p.resumeText && p.resumeText.trim()) {
    contextParts.push(`CANDIDATE RESUME:\n${p.resumeText.trim()}`);
  }
  const contextBlock = contextParts.length > 0
    ? `\n\n${contextParts.join("\n\n")}\n`
    : "";

  return `You are an expert interviewer producing a final holistic evaluation for a candidate interviewing for the role of "${p.role}".
Candidate experience level: ${p.experience}.
Interview type: ${p.interviewType}.
Difficulty: ${p.difficulty}.
Number of questions: ${s.questionCount}.
${contextBlock}

Here are all ${s.answers.length} questions and the candidate's answers with per-question scores:

${qaBlock}

Provide a genuine, holistic assessment across ALL answers. Do not simply repeat individual question feedback. Identify cross-cutting patterns, consistency, and overall readiness.

Return a single JSON object with exactly these fields:
{
  "overall": integer 0-100 — holistic weighted score across all answers,
  "technical": integer 0-100 — average technical depth across answers,
  "communication": integer 0-100 — average communication clarity,
  "problemSolving": integer 0-100 — average problem-solving ability,
  "relevance": integer 0-100 — average answer relevance,
  "strengths": array of 2-4 short strings highlighting cross-cutting strengths,
  "improvements": array of 2-4 short strings highlighting key areas to improve,
  "feedback": a 4-8 sentence narrative summary giving genuine holistic feedback,
  "recommended": array of 2-5 actionable practice recommendations tailored to this candidate
}

Return ONLY the JSON object. No markdown, no explanation.`;
}

function parseFinalEvaluation(
  raw: string,
): InterviewResultPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  const technical = clampScore(obj.technical, 50);
  const communication = clampScore(obj.communication, 50);
  const problemSolving = clampScore(obj.problemSolving, 50);
  const relevance = clampScore(obj.relevance, 50);
  const overall = clampScore(
    obj.overall,
    Math.round((technical + communication + problemSolving + relevance) / 4),
  );

  const feedback = typeof obj.feedback === "string" ? obj.feedback : "";
  const strengths = Array.isArray(obj.strengths)
    ? (obj.strengths as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];
  const improvements = Array.isArray(obj.improvements)
    ? (obj.improvements as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];
  const recommended = Array.isArray(obj.recommended)
    ? (obj.recommended as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];

  return {
    overall,
    technical,
    communication,
    problemSolving,
    relevance,
    strengths: strengths.length > 0 ? strengths : ["Completed the interview — good practice."],
    improvements: improvements.length > 0 ? improvements : ["Keep practicing to improve."],
    feedback,
    recommended: recommended.length > 0 ? recommended : ["Practice regularly to build confidence."],
  };
}

async function handleGenerateEvaluation(
  _userId: string,
  payload: Record<string, unknown>,
): Promise<InterviewResultPayload | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const session = payload.session as InterviewSessionPayload | undefined;
  if (!session || !Array.isArray(session.answers) || session.answers.length === 0) {
    return null;
  }

  const p: GenerateEvaluationPayload = {
    session,
    role: String(payload.role ?? session.role ?? "Other"),
    experience: String(payload.experience ?? session.experience ?? "Fresher"),
    interviewType: String(payload.interviewType ?? session.type ?? "Mixed"),
    difficulty: String(payload.difficulty ?? session.difficulty ?? "Medium"),
    jobDescription: typeof payload.jobDescription === "string" ? payload.jobDescription : undefined,
    resumeText: typeof payload.resumeText === "string" ? payload.resumeText : undefined,
  };

  const prompt = buildEvaluationPrompt(p);
  const raw = await callGemini(prompt, apiKey);
  if (!raw) return null;

  return parseFinalEvaluation(raw);
}

// ---------------------------------------------------------------------------
// Main request handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify authentication
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let body: BasePayload & Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { action } = body;
  if (!action) {
    return new Response(JSON.stringify({ error: "Missing 'action' field" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Route to the appropriate handler
  try {
    let result: unknown = null;

    switch (action) {
      case "generateQuestions":
        result = await handleGenerateQuestions(authResult.user.id, body);
        break;
      case "evaluateAnswer":
        result = await handleEvaluateAnswer(authResult.user.id, body);
        break;
      case "generateEvaluation":
        result = await handleGenerateEvaluation(authResult.user.id, body);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (result === null) {
      // Handler could not produce a result (key missing, AI error, not implemented).
      return new Response(JSON.stringify({ error: "AI_NOT_CONFIGURED" }), {
        status: 501,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    // Log the error message but never log secrets or full error stacks
    // that might contain environment values.
    console.error("Edge function error:", err instanceof Error ? err.message : "unknown");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
