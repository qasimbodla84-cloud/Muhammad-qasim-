import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Copy, Plus, Search } from 'lucide-react';
import { GRADE_PROFILES, SUBJECT_AREAS } from '../data/curriculumSeed';
import { GradeLevel, LessonPlan, SubjectArea } from '../types/lesson';
import { getTotalDuration } from '../utils/lessonHelpers';

interface CurriculumLibraryProps {
  lessons: LessonPlan[];
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onDuplicateLesson: (lesson: LessonPlan) => void;
  onCreateNew: (grade?: GradeLevel, subject?: SubjectArea) => void;
}

const GRADES: GradeLevel[] = [1, 2, 3, 4, 5];

export const CurriculumLibrary: React.FC<CurriculumLibraryProps> = ({
  lessons,
  activeLessonId,
  onSelectLesson,
  onDuplicateLesson,
  onCreateNew,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectArea | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (selectedGrade !== 'all' && lesson.grade !== selectedGrade) return false;
      if (selectedSubject !== 'all' && lesson.subject !== selectedSubject) return false;
      if (!q) return true;
      return (
        lesson.title.toLowerCase().includes(q) ||
        lesson.standardCode.toLowerCase().includes(q) ||
        lesson.unitName.toLowerCase().includes(q) ||
        lesson.essentialQuestion.toLowerCase().includes(q) ||
        lesson.objectives.some((o) => o.toLowerCase().includes(q))
      );
    });
  }, [lessons, selectedGrade, selectedSubject, searchQuery]);

  const gradeCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const lesson of lessons) {
      counts[lesson.grade] = (counts[lesson.grade] || 0) + 1;
    }
    return counts;
  }, [lessons]);

  const activeGradeProfile = selectedGrade !== 'all' ? GRADE_PROFILES[selectedGrade] : null;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      {/* Editorial Intro Header */}
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-slate-500">
            Elementary Curriculum Studio · Grades 1 through 5
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance]">
            Structured lesson plans built for primary classrooms
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">
            Browse standards-aligned units across Grades 1–5, adapt pacing blocks and differentiated
            tiers, or compose a fresh lesson plan from a grade-calibrated template.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 tabular-nums shrink-0">
          <div>
            <div className="text-xs text-slate-500">Total Plans</div>
            <div className="mt-0.5 font-mono text-xl font-medium text-slate-900">{lessons.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
          <div>
            <div className="text-xs text-slate-500">Grades Covered</div>
            <div className="mt-0.5 font-mono text-xl font-medium text-slate-900">1 – 5</div>
          </div>
          <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
          <div>
            <div className="text-xs text-slate-500">Core Subjects</div>
            <div className="mt-0.5 font-mono text-xl font-medium text-slate-900">5</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Grade Segmented Control */}
        <div
          className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
          role="group"
          aria-label="Filter by grade level"
        >
          <button
            type="button"
            onClick={() => setSelectedGrade('all')}
            className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
              selectedGrade === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Grades ({lessons.length})
          </button>
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGrade(g)}
              className={`min-h-[40px] rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                selectedGrade === g
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grade {g} ({gradeCounts[g] || 0})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic, standard, or objective..."
            aria-label="Search lesson plans"
            className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Subject Filter Row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-slate-500">Subject:</span>
        <button
          type="button"
          onClick={() => setSelectedSubject('all')}
          className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            selectedSubject === 'all'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
          }`}
        >
          All Subjects
        </button>
        {SUBJECT_AREAS.map((subj) => (
          <button
            key={subj}
            type="button"
            onClick={() => setSelectedSubject(subj)}
            className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedSubject === subj
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Grade Developmental Calibration Strip (shown when a specific grade 1-5 is selected) */}
      {activeGradeProfile && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-medium text-blue-700">
                {activeGradeProfile.label} · {activeGradeProfile.ageRange}
              </div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Developmental Pacing & Focus Guide
              </h2>
              <p className="mt-1 text-sm text-slate-600">{activeGradeProfile.pedagogicalFocus}</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-sm lg:border-t-0 lg:pt-0">
              <div>
                <div className="text-xs text-slate-500">Recommended Block</div>
                <div className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
                  {activeGradeProfile.recommendedBlockMinutes} min
                </div>
              </div>
              <div className="max-w-xs">
                <div className="text-xs text-slate-500">Attention Segment</div>
                <div className="mt-0.5 text-xs font-medium text-slate-800">
                  {activeGradeProfile.attentionGuide}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCreateNew(
                    activeGradeProfile.grade,
                    selectedSubject !== 'all' ? selectedSubject : 'Mathematics'
                  )
                }
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                New {activeGradeProfile.label} Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Grid */}
      {filteredLessons.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No lesson plans match your current filter
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
            Clear your search query or create a new lesson plan calibrated for{' '}
            {selectedGrade === 'all' ? 'Grades 1–5' : `Grade ${selectedGrade}`}.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedGrade('all');
                setSelectedSubject('all');
                setSearchQuery('');
              }}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() =>
                onCreateNew(
                  selectedGrade !== 'all' ? selectedGrade : 3,
                  selectedSubject !== 'all' ? selectedSubject : 'Mathematics'
                )
              }
              className="min-h-[40px] rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
            >
              Create Lesson Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => {
            const totalMinutes = getTotalDuration(lesson);
            const isSelected = lesson.id === activeLessonId;
            return (
              <article
                key={lesson.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-6 transition-colors ${
                  isSelected
                    ? 'border-blue-700 ring-1 ring-blue-700/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Quiet 1-line unboxed metadata (Zero-Pill Rule) */}
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
                    <span className="truncate">
                      Grade {lesson.grade} · {lesson.subject} · {totalMinutes} min
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">
                      {lesson.standardCode}
                    </span>
                  </div>

                  {/* Primary Title */}
                  <h3 className="mt-2.5 font-display text-lg font-semibold leading-snug text-slate-900">
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      className="text-left hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      {lesson.title}
                    </button>
                  </h3>

                  <p className="mt-1.5 text-xs font-medium text-slate-500">{lesson.unitName}</p>

                  {/* Essential Question / Objective Excerpt */}
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {lesson.essentialQuestion || lesson.objectives[0]}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {lesson.phases.length} phases · {lesson.materials.length} materials
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDuplicateLesson(lesson)}
                      title="Duplicate as editable copy"
                      aria-label={`Duplicate ${lesson.title}`}
                      className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0"
                    >
                      Open Plan
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
