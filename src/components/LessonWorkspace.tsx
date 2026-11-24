import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  Copy,
  Download,
  Edit3,
  Pause,
  Play,
  Plus,
  Printer,
  RotateCcw,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { GRADE_PROFILES } from '../data/curriculumSeed';
import { DayOfWeek, LessonPlan, TimeBlockId } from '../types/lesson';
import { getTotalDuration, lessonToMarkdown } from '../utils/lessonHelpers';

interface LessonWorkspaceProps {
  lesson: LessonPlan;
  allLessons: LessonPlan[];
  onSelectLesson: (id: string) => void;
  onBackToLibrary: () => void;
  onEditLesson: () => void;
  onDuplicateLesson: (lesson: LessonPlan) => void;
  onDeleteLesson: (lessonId: string) => void;
  onUpdateLesson: (updated: LessonPlan) => void;
  onOpenPrintView: () => void;
  onAssignToSchedule: (day: DayOfWeek, block: TimeBlockId, lessonId: string) => void;
}

const PHASE_SHADES = [
  'bg-blue-700',
  'bg-slate-800',
  'bg-teal-700',
  'bg-amber-600',
  'bg-indigo-700',
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const BLOCKS: { id: TimeBlockId; label: string }[] = [
  { id: 'morning-1', label: 'Morning Block 1' },
  { id: 'morning-2', label: 'Morning Block 2' },
  { id: 'midday', label: 'Midday Block' },
  { id: 'afternoon', label: 'Afternoon Block' },
];

export const LessonWorkspace: React.FC<LessonWorkspaceProps> = ({
  lesson,
  allLessons,
  onSelectLesson,
  onBackToLibrary,
  onEditLesson,
  onDuplicateLesson,
  onDeleteLesson,
  onUpdateLesson,
  onOpenPrintView,
  onAssignToSchedule,
}) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(
    (lesson.phases[0]?.durationMinutes || 5) * 60
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [newMaterialLabel, setNewMaterialLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scheduleDay, setScheduleDay] = useState<DayOfWeek>('Monday');
  const [scheduleBlock, setScheduleBlock] = useState<TimeBlockId>('morning-1');
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);

  const totalMinutes = getTotalDuration(lesson);
  const gradeProfile = GRADE_PROFILES[lesson.grade];
  const checkedCount = lesson.materials.filter((m) => m.checked).length;

  // Reset timer cleanly when switching lessons
  useEffect(() => {
    setActivePhaseIndex(0);
    setTimerRunning(false);
    setSecondsRemaining((lesson.phases[0]?.durationMinutes || 5) * 60);
    setConfirmDelete(false);
    setScheduleFeedback(null);
  }, [lesson.id]);

  // Countdown tick
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const currentPhase = lesson.phases[activePhaseIndex] || lesson.phases[0];

  const selectPhaseForTimer = (index: number) => {
    const phase = lesson.phases[index];
    if (!phase) return;
    setActivePhaseIndex(index);
    setTimerRunning(false);
    setSecondsRemaining(phase.durationMinutes * 60);
  };

  const resetPhaseTimer = () => {
    if (!currentPhase) return;
    setTimerRunning(false);
    setSecondsRemaining(currentPhase.durationMinutes * 60);
  };

  const handleNextPhase = () => {
    if (activePhaseIndex < lesson.phases.length - 1) {
      selectPhaseForTimer(activePhaseIndex + 1);
    }
  };

  const toggleMaterial = (materialId: string) => {
    const updated: LessonPlan = {
      ...lesson,
      materials: lesson.materials.map((m) =>
        m.id === materialId ? { ...m, checked: !m.checked } : m
      ),
    };
    onUpdateLesson(updated);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newMaterialLabel.trim();
    if (!label) return;
    const updated: LessonPlan = {
      ...lesson,
      materials: [
        ...lesson.materials,
        { id: `mat-${Date.now()}`, label, checked: false },
      ],
    };
    onUpdateLesson(updated);
    setNewMaterialLabel('');
  };

  const adjustPhaseMinutes = (phaseId: string, delta: number) => {
    const updatedPhases = lesson.phases.map((p) =>
      p.id === phaseId
        ? { ...p, durationMinutes: Math.max(1, p.durationMinutes + delta) }
        : p
    );
    onUpdateLesson({ ...lesson, phases: updatedPhases });
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

  const handleQuickSchedule = () => {
    onAssignToSchedule(scheduleDay, scheduleBlock, lesson.id);
    const blockLabel = BLOCKS.find((b) => b.id === scheduleBlock)?.label || scheduleBlock;
    setScheduleFeedback(`Added to ${scheduleDay} · ${blockLabel}`);
    window.setTimeout(() => setScheduleFeedback(null), 3000);
  };

  const formattedClock = `${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(
    secondsRemaining % 60
  ).padStart(2, '0')}`;
  const phaseTotalSeconds = Math.max(1, (currentPhase?.durationMinutes || 1) * 60);
  const progressPct = Math.max(0, Math.min(100, ((phaseTotalSeconds - secondsRemaining) / phaseTotalSeconds) * 100));

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-7">
      {/* Top Breadcrumb & Quick Lesson Switcher */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBackToLibrary}
          className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Curriculum Library
        </button>

        <div className="flex items-center gap-2.5">
          <label htmlFor="workspace-lesson-switch" className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Switch Lesson:
          </label>
          <select
            id="workspace-lesson-switch"
            value={lesson.id}
            onChange={(e) => onSelectLesson(e.target.value)}
            className="min-h-[40px] max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
          >
            {allLessons.map((item) => (
              <option key={item.id} value={item.id}>
                Grade {item.grade} · {item.subject} — {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-Zone Layout: Main Lesson Folio (left) + Control & Timer Deck (right) */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-start">
        {/* Left Zone: Structured Lesson Sheet */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-8">
          {/* Header Metadata (Zero-Pill unboxed text) */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-500 tabular-nums">
              <span className="text-blue-700">Grade {lesson.grade}</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{totalMinutes} min total</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">{lesson.standardCode}</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.unitName}</span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
              {lesson.title}
            </h1>

            {lesson.standardSummary && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                <span className="font-medium text-slate-800">Standard Focus: </span>
                {lesson.standardSummary}
              </p>
            )}
          </div>

          {/* Essential Question & Learning Objectives */}
          <div className="grid grid-cols-1 gap-6 border-b border-slate-200 py-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
                Essential Question
              </h2>
              <p className="mt-2 font-display text-lg font-medium leading-snug text-slate-900">
                “{lesson.essentialQuestion}”
              </p>
            </div>
            <div className="md:col-span-7 md:border-l md:border-slate-200 md:pl-6">
              <h2 className="font-sans text-xs font-semibold tracking-wide text-slate-500">
                Student Learning Objectives
              </h2>
              <ul className="mt-2.5 space-y-2">
                {lesson.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                    <span className="mt-1 font-mono text-xs font-medium text-blue-700 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Proportional Pacing Timeline & Sequence */}
          <div className="border-b border-slate-200 py-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-sans text-base font-semibold text-slate-900">
                  Instructional Pacing Sequence
                </h2>
                <p className="text-xs text-slate-500">
                  Select any phase to load it into the classroom timer, or adjust minutes inline.
                </p>
              </div>
              <div className="font-mono text-sm font-medium text-slate-900 tabular-nums">
                {totalMinutes} min total
              </div>
            </div>

            {/* Proportional Visual Bar */}
            <div
              className="mt-4 flex h-3 w-full overflow-hidden rounded-md bg-slate-100"
              role="group"
              aria-label="Proportional lesson pacing bar"
            >
              {lesson.phases.map((phase, idx) => {
                const widthPct = totalMinutes > 0 ? (phase.durationMinutes / totalMinutes) * 100 : 25;
                const shade = PHASE_SHADES[idx % PHASE_SHADES.length];
                const isSelected = idx === activePhaseIndex;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => selectPhaseForTimer(idx)}
                    title={`${phase.title} (${phase.durationMinutes} min)`}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full transition-opacity ${shade} ${
                      isSelected ? 'opacity-100 ring-2 ring-inset ring-white/80' : 'opacity-70 hover:opacity-95'
                    }`}
                    aria-label={`Select phase ${phase.title}, ${phase.durationMinutes} minutes`}
                  />
                );
              })}
            </div>

            {/* Phase Steps */}
            <div className="mt-5 divide-y divide-slate-200">
              {lesson.phases.map((phase, idx) => {
                const isActive = idx === activePhaseIndex;
                return (
                  <div
                    key={phase.id}
                    className={`py-4 transition-colors ${isActive ? 'bg-slate-50/80 -mx-3 px-3 rounded-lg' : ''}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => selectPhaseForTimer(idx)}
                        className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      >
                        <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span className="text-sm font-semibold text-slate-900 hover:text-blue-700">
                          {phase.title}
                        </span>
                        {isActive && (
                          <span className="text-xs font-medium text-blue-700">· Active in Timer</span>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5 tabular-nums">
                        <button
                          type="button"
                          onClick={() => adjustPhaseMinutes(phase.id, -1)}
                          aria-label={`Decrease duration for ${phase.title}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="min-w-[54px] text-center font-mono text-xs font-medium text-slate-800">
                          {phase.durationMinutes} min
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustPhaseMinutes(phase.id, 1)}
                          aria-label={`Increase duration for ${phase.title}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <div className="text-xs font-medium text-slate-500">Teacher Moves</div>
                        <p className="mt-1 leading-relaxed text-slate-700">{phase.teacherAction}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500">Student Engagement</div>
                        <p className="mt-1 leading-relaxed text-slate-700">{phase.studentAction}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Materials Prep Checklist */}
          <div className="border-b border-slate-200 py-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-base font-semibold text-slate-900">
                Classroom Materials Checklist
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {checkedCount} / {lesson.materials.length} ready
              </span>
            </div>

            <ul className="mt-3.5 space-y-2">
              {lesson.materials.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleMaterial(item.id)}
                    className="flex min-h-[40px] w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        item.checked
                          ? 'border-blue-700 bg-blue-700 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {item.checked && <Check className="h-3 w-3" aria-hidden="true" />}
                    </span>
                    <span className={item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}>
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddMaterial} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newMaterialLabel}
                onChange={(e) => setNewMaterialLabel(e.target.value)}
                placeholder="Add supply item (e.g., 24 glue sticks)..."
                aria-label="Add classroom material"
                className="min-h-[40px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Item
              </button>
            </form>
          </div>

          {/* Differentiated Instruction Matrix */}
          <div className="border-b border-slate-200 py-6">
            <h2 className="font-sans text-base font-semibold text-slate-900">
              Differentiated Instruction Tiers
            </h2>
            <div className="mt-4 grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="pb-4 md:pr-5 md:pb-0">
                <div className="text-xs font-semibold text-amber-700">Foundational Support</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {lesson.differentiation.support}
                </p>
              </div>
              <div className="py-4 md:px-5 md:py-0">
                <div className="text-xs font-semibold text-blue-700">Grade-Level Core</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {lesson.differentiation.core}
                </p>
              </div>
              <div className="pt-4 md:pl-5 md:pt-0">
                <div className="text-xs font-semibold text-emerald-700">Extension & Enrichment</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {lesson.differentiation.extension}
                </p>
              </div>
            </div>
          </div>

          {/* Formative Assessment & Teacher Notes */}
          <div className="pt-6">
            <h2 className="font-sans text-base font-semibold text-slate-900">
              Formative Assessment & Exit Check
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-slate-500">Exit Ticket Prompt</div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                  {lesson.assessmentPrompt}
                </p>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Mastery Success Criteria</div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                  {lesson.successCriteria}
                </p>
              </div>
            </div>

            {lesson.teacherNotes && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="text-xs font-medium text-slate-500">Classroom Preparation Note</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{lesson.teacherNotes}</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Zone: Classroom Pacing Timer & Lesson Controls */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:col-span-4">
          {/* Interactive Classroom Pacing Timer */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-sm font-semibold text-slate-900">
                Classroom Pacing Timer
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Phase {activePhaseIndex + 1} / {lesson.phases.length}
              </span>
            </div>

            <div className="mt-3 text-xs font-medium text-blue-700">
              {currentPhase ? currentPhase.title : 'Ready'}
            </div>

            <div className="mt-3 font-mono text-5xl font-medium tracking-tight text-slate-900 tabular-nums">
              {formattedClock}
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-blue-700 transition-transform duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap"
              >
                {timerRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    Start Timer
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetPhaseTimer}
                title="Reset phase clock"
                aria-label="Reset phase clock"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleNextPhase}
                disabled={activePhaseIndex >= lesson.phases.length - 1}
                title="Advance to next phase"
                aria-label="Advance to next phase"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Grade Pacing & Readiness Metrics */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-sans text-sm font-semibold text-slate-900">
              Grade {lesson.grade} Alignment Summary
            </h2>
            <dl className="mt-3 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500">Scheduled Duration</dt>
                <dd className="font-mono font-medium text-slate-900 tabular-nums">
                  {totalMinutes} min
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500">Recommended Block</dt>
                <dd className="font-mono font-medium text-slate-900 tabular-nums">
                  {gradeProfile.recommendedBlockMinutes} min
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500">Materials Prepared</dt>
                <dd className="font-mono font-medium text-slate-900 tabular-nums">
                  {checkedCount} of {lesson.materials.length}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {gradeProfile.attentionGuide}
            </p>
          </div>

          {/* Quick Schedule Assignment */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-sans text-sm font-semibold text-slate-900">
              Add to Weekly Teaching Plan
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(e.target.value as DayOfWeek)}
                aria-label="Select weekday"
                className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={scheduleBlock}
                onChange={(e) => setScheduleBlock(e.target.value as TimeBlockId)}
                aria-label="Select time block"
                className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
              >
                {BLOCKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleQuickSchedule}
              className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Assign to Schedule Slot
            </button>
            {scheduleFeedback && (
              <p className="mt-2 text-xs font-medium text-emerald-700">{scheduleFeedback}</p>
            )}
          </div>

          {/* Lesson Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-sans text-sm font-semibold text-slate-900">Lesson Actions</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onEditLesson}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                Edit Plan
              </button>
              <button
                type="button"
                onClick={onOpenPrintView}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Print Sheet
              </button>
              <button
                type="button"
                onClick={() => onDuplicateLesson(lesson)}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Duplicate
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export .MD
              </button>
            </div>

            {allLessons.length > 1 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-rose-700 hover:text-rose-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete Lesson Plan
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-700">Delete permanently?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLesson(lesson.id)}
                        className="rounded bg-rose-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-800"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
