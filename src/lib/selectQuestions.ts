import type { Question, Role, InterviewType } from './types';
import { getQuestionsForRole } from './questionBanks';

/**
 * Selects unique questions for a session. Never repeats a question within
 * one interview. Filters by interview type when not "Mixed", then fills
 * from the remaining bank to reach the requested count.
 */
export function selectQuestions(
  role: Role,
  type: InterviewType,
  count: number,
): Question[] {
  const bank = getQuestionsForRole(role);

  let primary: Question[];
  if (type === 'Mixed') {
    // Distribute across categories that exist for the role.
    const categories: Question['category'][] = [
      'Technical',
      'Problem Solving',
      'Behavioral',
      'HR',
    ];
    const perCat = Math.ceil(count / categories.length);
    const picked: Question[] = [];
    for (const cat of categories) {
      const pool = shuffle(bank.filter((q) => q.category === cat));
      picked.push(...pool.slice(0, perCat));
    }
    primary = picked.slice(0, count);
  } else {
    const catMap: Record<InterviewType, Question['category']> = {
      Technical: 'Technical',
      HR: 'HR',
      Behavioral: 'Behavioral',
      Mixed: 'Technical',
    };
    const preferred = bank.filter((q) => q.category === catMap[type]);
    const rest = bank.filter((q) => q.category !== catMap[type]);
    primary = [...shuffle(preferred), ...shuffle(rest)].slice(0, count);
  }

  // Guarantee uniqueness and exact count (fall back to any role question).
  const seen = new Set<string>();
  const unique = primary.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
  if (unique.length < count) {
    for (const q of shuffle(bank)) {
      if (unique.length >= count) break;
      if (!seen.has(q.id)) {
        unique.push(q);
        seen.add(q.id);
      }
    }
  }
  return unique.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
