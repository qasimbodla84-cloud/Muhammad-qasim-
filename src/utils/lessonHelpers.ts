import { LessonPlan, SubjectArea } from '../types/lesson';

export function getTotalDuration(lesson: LessonPlan): number {
  return lesson.phases.reduce((sum, phase) => sum + (Number(phase.durationMinutes) || 0), 0);
}

export function getSubjectDotColor(subject: SubjectArea): string {
  switch (subject) {
    case 'Mathematics':
      return '#1d4ed8';
    case 'English Language Arts':
      return '#0f766e';
    case 'Science':
      return '#15803d';
    case 'Social Studies':
      return '#b45309';
    case 'Visual Arts':
      return '#be185d';
  }
}

export function lessonToMarkdown(lesson: LessonPlan): string {
  const totalMins = getTotalDuration(lesson);
  const lines: string[] = [
    `# ${lesson.title}`,
    ``,
    `**Grade:** Grade ${lesson.grade} | **Subject:** ${lesson.subject} | **Duration:** ${totalMins} min | **Standard:** ${lesson.standardCode}`,
    `**Unit:** ${lesson.unitName}`,
    ``,
    `## Standard Alignment`,
    lesson.standardSummary || lesson.standardCode,
    ``,
    `## Essential Question`,
    lesson.essentialQuestion,
    ``,
    `## Learning Objectives`,
    ...lesson.objectives.map((obj) => `- ${obj}`),
    ``,
    `## Instructional Pacing Sequence (${totalMins} minutes)`,
    ...lesson.phases.map(
      (phase, i) =>
        `### ${i + 1}. ${phase.title} (${phase.durationMinutes} min)\n- **Teacher Action:** ${phase.teacherAction}\n- **Student Action:** ${phase.studentAction}`
    ),
    ``,
    `## Classroom Materials`,
    ...lesson.materials.map((m) => `- [${m.checked ? 'x' : ' '}] ${m.label}`),
    ``,
    `## Differentiated Instruction`,
    `- **Foundational Support:** ${lesson.differentiation.support}`,
    `- **Grade-Level Core:** ${lesson.differentiation.core}`,
    `- **Extension & Enrichment:** ${lesson.differentiation.extension}`,
    ``,
    `## Formative Assessment & Exit Check`,
    `- **Prompt:** ${lesson.assessmentPrompt}`,
    `- **Success Criteria:** ${lesson.successCriteria}`,
  ];

  if (lesson.teacherNotes.trim()) {
    lines.push('', '## Teacher Preparation Notes', lesson.teacherNotes);
  }

  return lines.join('\n');
}
