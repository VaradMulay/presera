// Core domain types for Presera. Kept centralized so Supabase/AI integration
// can later map these onto database rows without touching UI code.

export type Role =
  | 'Software Developer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Python Developer'
  | 'Java Developer'
  | 'Data Analyst'
  | 'QA Engineer'
  | 'Other';

export type ExperienceLevel =
  | 'Student'
  | 'Fresher'
  | '0-2 years'
  | '2-5 years'
  | '5+ years';

export type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Mixed';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionCategory =
  | 'Technical'
  | 'HR'
  | 'Behavioral'
  | 'Problem Solving';

export interface Question {
  id: string;
  role: Role;
  category: QuestionCategory;
  text: string;
  /** Sample/ideal answer used to bias local scoring (not shown to user). */
  idealKeywords: string[];
}

export interface AnswerRecord {
  questionId: string;
  question: string;
  category: QuestionCategory;
  answer: string;
  scores: SubScore;
}

export interface SubScore {
  technical: number;
  communication: number;
  problemSolving: number;
  relevance: number;
}

export interface InterviewResult {
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

export interface InterviewSession {
  id: string;
  userId: string;
  role: Role;
  experience: ExperienceLevel;
  type: InterviewType;
  difficulty: Difficulty;
  questionCount: number;
  jobDescription?: string;
  resumeName?: string;
  resumeId?: string;
  startedAt: string;
  completedAt?: string;
  questions: Question[];
  answers: AnswerRecord[];
  result?: InterviewResult;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface OnboardingProfile {
  role: Role;
  experience: ExperienceLevel;
  interviewType: InterviewType;
}

export interface FullUser extends User {
  onboarding?: OnboardingProfile;
  onboarded: boolean;
}
