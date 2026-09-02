import type {
  Difficulty,
  ExperienceLevel,
  InterviewType,
  Role,
} from './types';

export const ROLES: Role[] = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Python Developer',
  'Java Developer',
  'Data Analyst',
  'QA Engineer',
  'Other',
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Student',
  'Fresher',
  '0-2 years',
  '2-5 years',
  '5+ years',
];

export const INTERVIEW_TYPES: InterviewType[] = [
  'Technical',
  'HR',
  'Behavioral',
  'Mixed',
];

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export const QUESTION_COUNTS = [5, 10, 15] as const;
