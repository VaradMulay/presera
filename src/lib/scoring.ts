import type {
  AnswerRecord,
  InterviewResult,
  InterviewSession,
  SubScore,
} from './types';

/**
 * Local, heuristic scoring — no AI. Scores are derived from:
 *  - answer length / completeness (longer, structured answers score higher)
 *  - keyword overlap with the ideal-answer keywords for each question
 *
 * Clearly a placeholder until an AI evaluator is connected, but it produces
 * sensible, varied, deterministic-per-session results.
 */

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function keywordOverlap(answer: string, keywords: string[]): number {
  if (keywords.length === 0) return 0.5;
  const lower = answer.toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) hits++;
  }
  return hits / keywords.length;
}

function lengthScore(answer: string): number {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  // 0 words -> ~10, 40 words -> ~70, 120+ words -> ~95
  if (words === 0) return 10;
  if (words < 10) return 25 + words * 1.5;
  if (words < 40) return 40 + (words - 10) * 1;
  return clamp(70 + (words - 40) * 0.25, 0, 95);
}

export function scoreAnswer(
  answer: string,
  keywords: string[],
  category: AnswerRecord['category'],
): SubScore {
  const len = lengthScore(answer);
  const overlap = keywordOverlap(answer, keywords);
  const empty = answer.trim().length === 0;

  const relevance = empty ? 0 : clamp(len * 0.4 + overlap * 60, 0, 100);
  const communication = empty ? 0 : clamp(len * 0.7 + (answer.includes('.') ? 8 : 0), 0, 100);
  const problemSolving =
    empty ? 0 : clamp(len * 0.3 + overlap * 50 + (category === 'Problem Solving' ? 10 : 0), 0, 100);
  const technical =
    empty ? 0 : clamp(overlap * 70 + len * 0.3, 0, 100);

  return {
    technical: Math.round(technical),
    communication: Math.round(communication),
    problemSolving: Math.round(problemSolving),
    relevance: Math.round(relevance),
  };
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function computeResult(session: InterviewSession): InterviewResult {
  const answers = session.answers;
  const overall = avg(answers.map((a) =>
    avg([a.scores.technical, a.scores.communication, a.scores.problemSolving, a.scores.relevance]),
  ));
  const technical = avg(answers.map((a) => a.scores.technical));
  const communication = avg(answers.map((a) => a.scores.communication));
  const problemSolving = avg(answers.map((a) => a.scores.problemSolving));
  const relevance = avg(answers.map((a) => a.scores.relevance));

  const answered = answers.filter((a) => a.answer.trim().length > 0).length;
  const completion = answers.length ? answered / answers.length : 0;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (technical >= 70) strengths.push('Strong technical grounding — your answers referenced the right concepts.');
  if (communication >= 70) strengths.push('Clear, well-structured communication with complete explanations.');
  if (problemSolving >= 70) strengths.push('Good problem-solving instinct and logical approach.');
  if (relevance >= 70) strengths.push('Answers stayed on-topic and addressed what was asked.');

  if (technical < 60) improvements.push('Deepen technical fundamentals — review core concepts for your role.');
  if (communication < 60) improvements.push('Structure answers more clearly (e.g. STAR or point-reason-example).');
  if (problemSolving < 60) improvements.push('Practice walking through your reasoning step-by-step before concluding.');
  if (relevance < 60) improvements.push('Tie answers directly back to the question instead of going broad.');
  if (completion < 1) improvements.push('Attempt every question — partial answers score higher than blanks.');

  if (strengths.length === 0) strengths.push('You completed the interview — that itself is good practice.');
  if (improvements.length === 0) improvements.push('Keep practicing to push your scores from good to great.');

  const feedback = generateFeedback(overall, completion);

  const recommended = recommend(technical, communication, problemSolving, relevance);

  return {
    overall: clamp(overall + Math.round(completion * 5 - 2), 0, 100),
    technical,
    communication,
    problemSolving,
    relevance,
    strengths,
    improvements,
    feedback,
    recommended,
  };
}

function generateFeedback(overall: number, completion: number): string {
  if (completion < 0.5) {
    return 'You left several questions unanswered. In a real interview, attempting every question — even partially — demonstrates effort and reasoning. Try to answer each one, even when unsure.';
  }
  if (overall >= 85) {
    return 'Excellent performance. Your answers were thorough, technically sound, and well communicated. With this level you would confidently clear most early-career interviews. Keep refining edge-case explanations.';
  }
  if (overall >= 70) {
    return 'Solid interview. You demonstrated good understanding and clear communication. A little more depth on technical specifics and structured examples will push you into the top tier.';
  }
  if (overall >= 50) {
    return 'A fair attempt with room to grow. Focus on structuring answers (try the STAR method for behavioral questions) and revisiting core concepts for your role. Practice will noticeably raise your scores.';
  }
  return 'This is a starting point, not a verdict. Revisit the fundamentals for your target role, practice explaining concepts out loud, and retake the interview. Consistency matters more than any single score.';
}

function recommend(
  technical: number,
  communication: number,
  problemSolving: number,
  relevance: number,
): string[] {
  const recs: string[] = [];
  if (technical < 70) recs.push('Revisit core technical concepts with flashcards or short notes.');
  if (communication < 70) recs.push('Practice answering behavioral questions using the STAR framework.');
  if (problemSolving < 70) recs.push('Solve 2–3 coding problems daily and explain your approach aloud.');
  if (relevance < 70) recs.push('Re-read each question carefully and answer exactly what is asked.');
  if (recs.length === 0) {
    recs.push('Try a harder difficulty level to stretch your limits.');
    recs.push('Do a Mixed interview to balance technical and soft-skill practice.');
  }
  return recs.slice(0, 4);
}
