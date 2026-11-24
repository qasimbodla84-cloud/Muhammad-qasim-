import React from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { LessonPlan } from '../types/lesson';
import { getTotalDuration, lessonToMarkdown } from '../utils/lessonHelpers';

interface PrintSheetViewProps {
  lesson: LessonPlan;
  allLessons: LessonPlan[];
  onSelectLesson: (id: string) => void;
  onBackToWorkspace: () => void;
}

export const PrintSheetView: React.FC<PrintSheetViewProps> = ({
  lesson,
  allLessons,
  onSelectLesson,
  onBackToWorkspace,
}) => {
  const totalMinutes = getTotalDuration(lesson);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const md = lessonToMarkdown(lesson);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grade-${lesson.grade}-${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[920px] px-6 py-8">
      {/* Screen-only toolbar */}
      <div className="no-print mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBackToWorkspace}
          className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Workspace
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={lesson.id}
            onChange={(e) => onSelectLesson(e.target.value)}
            aria-label="Select lesson plan to print"
            className="min-h-[40px] max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
          >
            {allLessons.map((item) => (
              <option key={item.id} value={item.id}>
                Grade {item.grade} · {item.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export .MD
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Folio Sheet */}
      <article className="print-only-sheet rounded-xl border border-slate-200 bg-white p-8 sm:p-10">
        <header className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-600 tabular-nums">
            <span>
              Grade {lesson.grade} · {lesson.subject} · {lesson.unitName}
            </span>
            <span className="font-mono text-slate-900">
              {lesson.standardCode} · {totalMinutes} min
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
            {lesson.title}
          </h1>
          {lesson.standardSummary && (
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {lesson.standardSummary}
            </p>
          )}
        </header>

        <section className="grid grid-cols-1 gap-6 border-b border-slate-200 py-5 sm:grid-cols-2">
          <div>
            <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
              Essential Question
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-900">
              {lesson.essentialQuestion}
            </p>
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
              Learning Objectives
            </h2>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-slate-800">
              {lesson.objectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-slate-200 py-5">
          <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
            Instructional Pacing ({totalMinutes} Minutes)
          </h2>
          <table className="mt-3 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-xs text-slate-600">
                <th className="w-20 py-2 pr-3 font-semibold">Time</th>
                <th className="w-44 py-2 pr-3 font-semibold">Lesson Phase</th>
                <th className="py-2 pr-3 font-semibold">Teacher Moves</th>
                <th className="py-2 font-semibold">Student Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 align-top">
              {lesson.phases.map((phase, idx) => (
                <tr key={phase.id}>
                  <td className="py-3 pr-3 font-mono text-xs text-slate-800 tabular-nums">
                    {phase.durationMinutes} min
                  </td>
                  <td className="py-3 pr-3 font-medium text-slate-900">
                    {idx + 1}. {phase.title}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{phase.teacherAction}</td>
                  <td className="py-3 text-slate-700">{phase.studentAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid grid-cols-1 gap-6 border-b border-slate-200 py-5 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
              Classroom Materials
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
              {lesson.materials.map((m) => (
                <li key={m.id} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-xs border border-slate-400" />
                  <span>{m.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-7 sm:border-l sm:border-slate-200 sm:pl-6">
            <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
              Differentiation Matrix
            </h2>
            <dl className="mt-2 space-y-2 text-sm">
              <div>
                <dt className="font-semibold text-slate-900">Foundational Support:</dt>
                <dd className="text-slate-700">{lesson.differentiation.support}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Grade-Level Core:</dt>
                <dd className="text-slate-700">{lesson.differentiation.core}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Extension:</dt>
                <dd className="text-slate-700">{lesson.differentiation.extension}</dd>
              </div>
            </dl>
          </div>
        </section>

        <footer className="pt-5 text-sm">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
                Formative Exit Ticket
              </h2>
              <p className="mt-1 text-slate-800">{lesson.assessmentPrompt}</p>
            </div>
            <div>
              <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
                Success Criteria
              </h2>
              <p className="mt-1 text-slate-800">{lesson.successCriteria}</p>
            </div>
          </div>
          {lesson.teacherNotes && (
            <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-600">
              <strong>Preparation Note:</strong> {lesson.teacherNotes}
            </div>
          )}
        </footer>
      </article>
    </div>
  );
};
