export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type SubjectArea =
  | 'Mathematics'
  | 'English Language Arts'
  | 'Science'
  | 'Social Studies'
  | 'Visual Arts';

export interface LessonPhase {
  id: string;
  title: string;
  durationMinutes: number;
  teacherAction: string;
  studentAction: string;
}

export interface MaterialItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface DifferentiationTiers {
  support: string;
  core: string;
  extension: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  grade: GradeLevel;
  subject: SubjectArea;
  standardCode: string;
  standardSummary: string;
  unitName: string;
  objectives: string[];
  essentialQuestion: string;
  phases: LessonPhase[];
  materials: MaterialItem[];
  differentiation: DifferentiationTiers;
  assessmentPrompt: string;
  successCriteria: string;
  teacherNotes: string;
  updatedAt: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export type TimeBlockId = 'morning-1' | 'morning-2' | 'midday' | 'afternoon';

export interface WeeklyScheduleMap {
  [slotKey: string]: string | null; // `${DayOfWeek}::${TimeBlockId}` -> lessonId
}

export type AppView = 'library' | 'workspace' | 'schedule' | 'print' | 'editor';
