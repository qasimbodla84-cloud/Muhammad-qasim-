import React, { useMemo, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import {
  DayOfWeek,
  GradeLevel,
  LessonPlan,
  TimeBlockId,
  WeeklyScheduleMap,
} from '../types/lesson';
import { getTotalDuration } from '../utils/lessonHelpers';

interface WeeklyScheduleProps {
  lessons: LessonPlan[];
  schedule: WeeklyScheduleMap;
  onAssignSlot: (day: DayOfWeek, block: TimeBlockId, lessonId: string | null) => void;
  onOpenLesson: (lessonId: string) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const BLOCKS: { id: TimeBlockId; label: string; window: string }[] = [
  { id: 'morning-1', label: 'Morning Block 1', window: '08:30 – 09:30' },
  { id: 'morning-2', label: 'Morning Block 2', window: '09:45 – 10:45' },
  { id: 'midday', label: 'Midday Block', window: '12:45 – 13:45' },
  { id: 'afternoon', label: 'Afternoon Block', window: '14:00 – 15:00' },
];
const GRADES: GradeLevel[] = [1, 2, 3, 4, 5];

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  lessons,
  schedule,
  onAssignSlot,
  onOpenLesson,
}) => {
  const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null);

  const lessonById = useMemo(() => {
    const map = new Map<string, LessonPlan>();
    for (const l of lessons) map.set(l.id, l);
    return map;
  }, [lessons]);

  const selectableLessons = useMemo(() => {
    if (gradeFilter === 'all') return lessons;
    return lessons.filter((l) => l.grade === gradeFilter);
  }, [lessons, gradeFilter]);

  const weeklySummary = useMemo(() => {
    let totalMinutes = 0;
    let scheduledCount = 0;
    const bySubject: Record<string, number> = {};

    for (const day of DAYS) {
      for (const block of BLOCKS) {
        const key = `${day}::${block.id}`;
        const lid = schedule[key];
        if (!lid) continue;
        const lesson = lessonById.get(lid);
        if (!lesson) continue;
        if (gradeFilter !== 'all' && lesson.grade !== gradeFilter) continue;

        const mins = getTotalDuration(lesson);
        totalMinutes += mins;
        scheduledCount += 1;
        bySubject[lesson.subject] = (bySubject[lesson.subject] || 0) + mins;
      }
    }

    return { totalMinutes, scheduledCount, bySubject };
  }, [schedule, lessonById, gradeFilter]);

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8">
      {/* Header & Grade Filter */}
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Weekly Teaching Pacing Grid</p>
          <h1 className="mt-1.5 font-display text-3xl font-semibold text-slate-900">
            Monday–Friday Lesson Schedule
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Assign any Grade 1–5 lesson plan into daily teaching blocks and track weekly instructional minutes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setGradeFilter('all')}
              className={`min-h-[38px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                gradeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Grades
            </button>
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGradeFilter(g)}
                className={`min-h-[38px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  gradeFilter === g
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Instructional Summary Strip */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-6 tabular-nums">
          <div>
            <span className="text-xs text-slate-500">Scheduled Lessons</span>
            <div className="font-mono text-lg font-medium text-slate-900">
              {weeklySummary.scheduledCount} / 20 slots
            </div>
          </div>
          <div className="h-7 w-px bg-slate-200" aria-hidden="true" />
          <div>
            <span className="text-xs text-slate-500">Total Weekly Instruction</span>
            <div className="font-mono text-lg font-medium text-slate-900">
              {weeklySummary.totalMinutes} min
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 tabular-nums">
          {Object.entries(weeklySummary.bySubject).length === 0 ? (
            <span className="text-slate-400">No lessons slotted for this filter yet.</span>
          ) : (
            Object.entries(weeklySummary.bySubject).map(([subj, mins], i) => (
              <React.Fragment key={subj}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <span>
                  {subj}: <strong className="font-mono text-slate-900">{mins}m</strong>
                </span>
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* 5-Day Schedule Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="w-44 px-4 py-3.5 text-xs font-semibold text-slate-600">
                Daily Block
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border-l border-slate-200 px-4 py-3.5 text-xs font-semibold text-slate-800"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {BLOCKS.map((block) => (
              <tr key={block.id} className="align-top">
                <td className="px-4 py-4">
                  <div className="text-xs font-semibold text-slate-900">{block.label}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                    {block.window}
                  </div>
                </td>

                {DAYS.map((day) => {
                  const slotKey = `${day}::${block.id}`;
                  const assignedId = schedule[slotKey] || null;
                  const assignedLesson = assignedId ? lessonById.get(assignedId) : undefined;
                  const visibleMatch =
                    assignedLesson &&
                    (gradeFilter === 'all' || assignedLesson.grade === gradeFilter);
                  const isEditing = editingSlotKey === slotKey;

                  return (
                    <td
                      key={slotKey}
                      className="border-l border-slate-200 p-3 transition-colors hover:bg-slate-50/60"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <select
                            autoFocus
                            defaultValue={assignedId || ''}
                            onChange={(e) => {
                              const val = e.target.value || null;
                              onAssignSlot(day, block.id, val);
                              setEditingSlotKey(null);
                            }}
                            aria-label={`Assign lesson for ${day} ${block.label}`}
                            className="min-h-[38px] w-full rounded-md border border-blue-700 bg-white px-2 text-xs text-slate-900 focus:outline-none"
                          >
                            <option value="">— Clear Slot —</option>
                            {selectableLessons.map((l) => (
                              <option key={l.id} value={l.id}>
                                G{l.grade} · {l.subject}: {l.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setEditingSlotKey(null)}
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : visibleMatch && assignedLesson ? (
                        <div className="flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-3">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                                Grade {assignedLesson.grade} · {getTotalDuration(assignedLesson)}m
                              </span>
                              <button
                                type="button"
                                onClick={() => onAssignSlot(day, block.id, null)}
                                title="Remove from slot"
                                aria-label={`Remove ${assignedLesson.title} from ${day} ${block.label}`}
                                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onOpenLesson(assignedLesson.id)}
                              className="mt-1.5 line-clamp-2 text-left text-xs font-semibold leading-snug text-slate-900 hover:text-blue-700"
                            >
                              {assignedLesson.title}
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="truncate">{assignedLesson.subject}</span>
                            <button
                              type="button"
                              onClick={() => setEditingSlotKey(slotKey)}
                              className="font-medium text-blue-700 hover:underline shrink-0"
                            >
                              Swap
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingSlotKey(slotKey)}
                          className="flex min-h-[92px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-400 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-700"
                        >
                          <span>+ Assign Lesson</span>
                          {assignedLesson && !visibleMatch && (
                            <span className="mt-1 text-[10px] text-slate-400">
                              (Occupied by Grade {assignedLesson.grade})
                            </span>
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Helper Link Tip */}
      <div className="mt-4 flex items-center justify-end text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          Click any scheduled lesson title to launch its classroom timer & materials checklist
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};
