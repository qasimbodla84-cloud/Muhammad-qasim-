import React, { useState } from 'react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import {
  createStarterLessonTemplate,
  GRADE_PROFILES,
  SUBJECT_AREAS,
} from '../data/curriculumSeed';
import { GradeLevel, LessonPhase, LessonPlan, SubjectArea } from '../types/lesson';
import { getTotalDuration } from '../utils/lessonHelpers';

interface LessonEditorProps {
  initialLesson: LessonPlan;
  isNew: boolean;
  onSave: (lesson: LessonPlan) => void;
  onCancel: () => void;
}

const GRADES: GradeLevel[] = [1, 2, 3, 4, 5];

export const LessonEditor: React.FC<LessonEditorProps> = ({
  initialLesson,
  isNew,
  onSave,
  onCancel,
}) => {
  const [draft, setDraft] = useState<LessonPlan>(initialLesson);
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalMinutes = getTotalDuration(draft);
  const gradeProfile = GRADE_PROFILES[draft.grade];

  const handleGradeChange = (grade: GradeLevel) => {
    if (isNew && !draft.title.trim()) {
      const fresh = createStarterLessonTemplate(grade, draft.subject);
      setDraft({ ...fresh, id: draft.id });
    } else {
      setDraft({ ...draft, grade });
    }
  };

  const handleObjectiveChange = (idx: number, val: string) => {
    const next = [...draft.objectives];
    next[idx] = val;
    setDraft({ ...draft, objectives: next });
  };

  const addObjective = () => {
    setDraft({ ...draft, objectives: [...draft.objectives, 'I can '] });
  };

  const removeObjective = (idx: number) => {
    if (draft.objectives.length <= 1) return;
    setDraft({
      ...draft,
      objectives: draft.objectives.filter((_, i) => i !== idx),
    });
  };

  const updatePhase = (phaseId: string, field: keyof LessonPhase, value: string | number) => {
    setDraft({
      ...draft,
      phases: draft.phases.map((p) => (p.id === phaseId ? { ...p, [field]: value } : p)),
    });
  };

  const addPhase = () => {
    const newPhase: LessonPhase = {
      id: `ph-${Date.now()}`,
      title: 'Practice Station',
      durationMinutes: 10,
      teacherAction: '',
      studentAction: '',
    };
    setDraft({ ...draft, phases: [...draft.phases, newPhase] });
  };

  const removePhase = (phaseId: string) => {
    if (draft.phases.length <= 1) return;
    setDraft({ ...draft, phases: draft.phases.filter((p) => p.id !== phaseId) });
  };

  const updateMaterial = (matId: string, label: string) => {
    setDraft({
      ...draft,
      materials: draft.materials.map((m) => (m.id === matId ? { ...m, label } : m)),
    });
  };

  const addMaterial = () => {
    setDraft({
      ...draft,
      materials: [
        ...draft.materials,
        { id: `mat-${Date.now()}`, label: '', checked: false },
      ],
    });
  };

  const removeMaterial = (matId: string) => {
    setDraft({ ...draft, materials: draft.materials.filter((m) => m.id !== matId) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setValidationError('Please enter a lesson title before saving.');
      return;
    }
    const cleaned: LessonPlan = {
      ...draft,
      title: draft.title.trim(),
      objectives: draft.objectives.map((o) => o.trim()).filter(Boolean),
      materials: draft.materials.filter((m) => m.label.trim()),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSave(cleaned);
  };

  return (
    <div className="mx-auto max-w-[1040px] px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Cancel
        </button>

        <div className="font-mono text-xs text-slate-500 tabular-nums">
          Total Pacing: {totalMinutes} min (Grade {draft.grade} target: {gradeProfile.recommendedBlockMinutes} min)
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-medium text-blue-700">
            {isNew ? 'Create Grade 1–5 Lesson Plan' : 'Edit Lesson Plan'}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-slate-900">
            {isNew ? 'New Elementary Lesson Folio' : draft.title || 'Untitled Lesson'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">{gradeProfile.pedagogicalFocus}</p>
        </div>

        {validationError && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {validationError}
          </div>
        )}

        {/* Grade, Subject, Title, Standard */}
        <div className="mt-6 space-y-5 border-b border-slate-200 pb-6">
          <div>
            <span className="block text-xs font-semibold text-slate-700">Grade Level</span>
            <div className="mt-2 inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGradeChange(g)}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    draft.grade === g
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lesson-subject" className="block text-xs font-semibold text-slate-700">
                Subject Area
              </label>
              <select
                id="lesson-subject"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value as SubjectArea })}
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              >
                {SUBJECT_AREAS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lesson-unit" className="block text-xs font-semibold text-slate-700">
                Unit Name
              </label>
              <input
                id="lesson-unit"
                type="text"
                value={draft.unitName}
                onChange={(e) => setDraft({ ...draft, unitName: e.target.value })}
                placeholder="e.g., Unit 3 · Fractions on a Number Line"
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lesson-title" className="block text-xs font-semibold text-slate-700">
              Lesson Title
            </label>
            <input
              id="lesson-title"
              type="text"
              value={draft.title}
              onChange={(e) => {
                setValidationError(null);
                setDraft({ ...draft, title: e.target.value });
              }}
              placeholder="e.g., Comparing Fractions Using Benchmarks"
              className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3.5 text-base font-medium text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="lesson-std-code" className="block text-xs font-semibold text-slate-700">
                Standard Code
              </label>
              <input
                id="lesson-std-code"
                type="text"
                value={draft.standardCode}
                onChange={(e) => setDraft({ ...draft, standardCode: e.target.value })}
                placeholder="e.g., CCSS.MATH.3.NF.A.2"
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lesson-std-desc" className="block text-xs font-semibold text-slate-700">
                Standard Summary
              </label>
              <input
                id="lesson-std-desc"
                type="text"
                value={draft.standardSummary}
                onChange={(e) => setDraft({ ...draft, standardSummary: e.target.value })}
                placeholder="Brief curriculum standard description..."
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Essential Question & Objectives */}
        <div className="mt-6 space-y-5 border-b border-slate-200 pb-6">
          <div>
            <label htmlFor="lesson-eq" className="block text-xs font-semibold text-slate-700">
              Essential Question
            </label>
            <input
              id="lesson-eq"
              type="text"
              value={draft.essentialQuestion}
              onChange={(e) => setDraft({ ...draft, essentialQuestion: e.target.value })}
              placeholder="What driving question guides student discovery today?"
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Student Learning Objectives ("I Can" Statements)
              </span>
              <button
                type="button"
                onClick={addObjective}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Objective
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {draft.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                    placeholder="I can..."
                    className="min-h-[40px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                  {draft.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(idx)}
                      aria-label="Remove objective"
                      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructional Phases */}
        <div className="mt-6 border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-sans text-sm font-semibold text-slate-900">
                Instructional Pacing Phases
              </h2>
              <p className="text-xs text-slate-500">
                Break the lesson into Grade {draft.grade} age-appropriate segments.
              </p>
            </div>
            <button
              type="button"
              onClick={addPhase}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Phase
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-200">
            {draft.phases.map((phase, idx) => (
              <div key={phase.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <input
                    type="text"
                    value={phase.title}
                    onChange={(e) => updatePhase(phase.id, 'title', e.target.value)}
                    placeholder="Phase title"
                    className="min-h-[40px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={phase.durationMinutes}
                      onChange={(e) =>
                        updatePhase(phase.id, 'durationMinutes', Math.max(1, Number(e.target.value) || 1))
                      }
                      aria-label="Duration in minutes"
                      className="min-h-[40px] w-20 rounded-lg border border-slate-200 bg-white px-2.5 text-right font-mono text-sm text-slate-900 tabular-nums focus:border-blue-700 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">min</span>
                  </div>
                  {draft.phases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhase(phase.id)}
                      aria-label="Remove phase"
                      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Teacher Moves</label>
                    <textarea
                      rows={2}
                      value={phase.teacherAction}
                      onChange={(e) => updatePhase(phase.id, 'teacherAction', e.target.value)}
                      placeholder="What does the teacher model, ask, or facilitate?"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Student Engagement</label>
                    <textarea
                      rows={2}
                      value={phase.studentAction}
                      onChange={(e) => updatePhase(phase.id, 'studentAction', e.target.value)}
                      placeholder="What are students doing, building, or discussing?"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materials & Differentiation */}
        <div className="mt-6 space-y-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Classroom Materials</span>
              <button
                type="button"
                onClick={addMaterial}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Material
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {draft.materials.map((mat) => (
                <div key={mat.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mat.label}
                    onChange={(e) => updateMaterial(mat.id, e.target.value)}
                    placeholder="Manipulatives, texts, or handouts..."
                    className="min-h-[40px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeMaterial(mat.id)}
                    aria-label="Remove material"
                    className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="diff-support" className="block text-xs font-semibold text-amber-700">
                Foundational Support
              </label>
              <textarea
                id="diff-support"
                rows={3}
                value={draft.differentiation.support}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    differentiation: { ...draft.differentiation, support: e.target.value },
                  })
                }
                placeholder="Scaffolds, manipulatives, or sentence stems..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="diff-core" className="block text-xs font-semibold text-blue-700">
                Grade-Level Core
              </label>
              <textarea
                id="diff-core"
                rows={3}
                value={draft.differentiation.core}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    differentiation: { ...draft.differentiation, core: e.target.value },
                  })
                }
                placeholder="Standard independent expectation..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="diff-extension" className="block text-xs font-semibold text-emerald-700">
                Extension & Enrichment
              </label>
              <textarea
                id="diff-extension"
                rows={3}
                value={draft.differentiation.extension}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    differentiation: { ...draft.differentiation, extension: e.target.value },
                  })
                }
                placeholder="Deeper reasoning or multi-step challenge..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Assessment & Notes */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="assess-prompt" className="block text-xs font-semibold text-slate-700">
                Exit Ticket Prompt
              </label>
              <textarea
                id="assess-prompt"
                rows={2}
                value={draft.assessmentPrompt}
                onChange={(e) => setDraft({ ...draft, assessmentPrompt: e.target.value })}
                placeholder="Quick check at lesson end..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="assess-criteria" className="block text-xs font-semibold text-slate-700">
                Mastery Success Criteria
              </label>
              <textarea
                id="assess-criteria"
                rows={2}
                value={draft.successCriteria}
                onChange={(e) => setDraft({ ...draft, successCriteria: e.target.value })}
                placeholder="What indicates mastery?"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="teacher-notes" className="block text-xs font-semibold text-slate-700">
              Teacher Preparation Notes
            </label>
            <textarea
              id="teacher-notes"
              rows={2}
              value={draft.teacherNotes}
              onChange={(e) => setDraft({ ...draft, teacherNotes: e.target.value })}
              placeholder="Common misconceptions to watch for or prep reminders..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            Save Lesson Plan
          </button>
        </div>
      </form>
    </div>
  );
};
