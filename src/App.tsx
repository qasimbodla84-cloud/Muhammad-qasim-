import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { CurriculumLibrary } from './components/CurriculumLibrary';
import { LessonEditor } from './components/LessonEditor';
import { LessonWorkspace } from './components/LessonWorkspace';
import { PrintSheetView } from './components/PrintSheetView';
import { WeeklySchedule } from './components/WeeklySchedule';
import {
  createStarterLessonTemplate,
  INITIAL_LESSON_PLANS,
  INITIAL_WEEKLY_SCHEDULE,
} from './data/curriculumSeed';
import {
  AppView,
  DayOfWeek,
  GradeLevel,
  LessonPlan,
  SubjectArea,
  TimeBlockId,
  WeeklyScheduleMap,
} from './types/lesson';

const STORAGE_KEY_LESSONS = 'primary_folio_lessons_v1';
const STORAGE_KEY_SCHEDULE = 'primary_folio_schedule_v1';

export default function App() {
  const [lessons, setLessons] = useState<LessonPlan[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LESSONS);
      if (raw) {
        const parsed = JSON.parse(raw) as LessonPlan[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial seed
    }
    return INITIAL_LESSON_PLANS;
  });

  const [schedule, setSchedule] = useState<WeeklyScheduleMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (raw) {
        const parsed = JSON.parse(raw) as WeeklyScheduleMap;
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // Fallback to initial schedule
    }
    return INITIAL_WEEKLY_SCHEDULE;
  });

  const [activeView, setActiveView] = useState<AppView>('library');
  const [activeLessonId, setActiveLessonId] = useState<string>(
    () => lessons[0]?.id || INITIAL_LESSON_PLANS[0].id
  );
  const [editorDraft, setEditorDraft] = useState<{ lesson: LessonPlan; isNew: boolean } | null>(
    null
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(lessons));
    } catch {
      // Ignore storage quota issues
    }
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    } catch {
      // Ignore storage quota issues
    }
  }, [schedule]);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveView('workspace');
  };

  const handleCreateNew = (grade: GradeLevel = 3, subject: SubjectArea = 'Mathematics') => {
    const template = createStarterLessonTemplate(grade, subject);
    setEditorDraft({ lesson: template, isNew: true });
    setActiveView('editor');
  };

  const handleEditActive = () => {
    if (!activeLesson) return;
    setEditorDraft({ lesson: activeLesson, isNew: false });
    setActiveView('editor');
  };

  const handleSaveEditor = (saved: LessonPlan) => {
    setLessons((prev) => {
      const exists = prev.some((l) => l.id === saved.id);
      if (exists) {
        return prev.map((l) => (l.id === saved.id ? saved : l));
      }
      return [saved, ...prev];
    });
    setActiveLessonId(saved.id);
    setEditorDraft(null);
    setActiveView('workspace');
  };

  const handleDuplicateLesson = (lesson: LessonPlan) => {
    const copy: LessonPlan = {
      ...lesson,
      id: `copy-${Date.now()}`,
      title: `${lesson.title} (Copy)`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setLessons((prev) => [copy, ...prev]);
    setActiveLessonId(copy.id);
    setActiveView('workspace');
  };

  const handleDeleteLesson = (lessonId: string) => {
    const remaining = lessons.filter((l) => l.id !== lessonId);
    if (remaining.length === 0) return;
    setLessons(remaining);
    setSchedule((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === lessonId) next[key] = null;
      }
      return next;
    });
    setActiveLessonId(remaining[0].id);
    setActiveView('library');
  };

  const handleUpdateLesson = (updated: LessonPlan) => {
    setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleAssignSchedule = (
    day: DayOfWeek,
    block: TimeBlockId,
    lessonId: string | null
  ) => {
    const key = `${day}::${block}`;
    setSchedule((prev) => ({ ...prev, [key]: lessonId }));
  };

  const navItems: { id: AppView; label: string }[] = [
    { id: 'library', label: 'Curriculum Library' },
    { id: 'workspace', label: 'Lesson Workspace' },
    { id: 'schedule', label: 'Weekly Schedule' },
    { id: 'print', label: 'Print View' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones (Brand Wordmark — 4 single-line nav links — 1 primary CTA) */}
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-8 px-6 py-4">
          <a
            href="#library"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('library');
            }}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Primary Folio
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 text-sm font-medium md:flex"
          >
            {navItems.map((item) => {
              const isActive =
                activeView === item.id ||
                (activeView === 'editor' && item.id === 'workspace');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`border-b-2 py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                    isActive
                      ? 'border-blue-700 text-slate-900'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleCreateNew(activeLesson?.grade || 3, activeLesson?.subject || 'Mathematics')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              New Lesson Plan
            </button>
          </div>
        </div>

        {/* Mobile navigation row */}
        <nav
          aria-label="Mobile navigation"
          className="flex items-center gap-4 overflow-x-auto border-t border-slate-100 px-6 py-2.5 text-xs font-medium md:hidden"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`whitespace-nowrap shrink-0 pb-0.5 ${
                  isActive ? 'border-b-2 border-blue-700 text-slate-900' : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main>
        {activeView === 'library' && (
          <CurriculumLibrary
            lessons={lessons}
            activeLessonId={activeLesson?.id || ''}
            onSelectLesson={handleSelectLesson}
            onDuplicateLesson={handleDuplicateLesson}
            onCreateNew={handleCreateNew}
          />
        )}

        {activeView === 'workspace' && activeLesson && (
          <LessonWorkspace
            lesson={activeLesson}
            allLessons={lessons}
            onSelectLesson={(id) => setActiveLessonId(id)}
            onBackToLibrary={() => setActiveView('library')}
            onEditLesson={handleEditActive}
            onDuplicateLesson={handleDuplicateLesson}
            onDeleteLesson={handleDeleteLesson}
            onUpdateLesson={handleUpdateLesson}
            onOpenPrintView={() => setActiveView('print')}
            onAssignToSchedule={handleAssignSchedule}
          />
        )}

        {activeView === 'schedule' && (
          <WeeklySchedule
            lessons={lessons}
            schedule={schedule}
            onAssignSlot={handleAssignSchedule}
            onOpenLesson={handleSelectLesson}
          />
        )}

        {activeView === 'print' && activeLesson && (
          <PrintSheetView
            lesson={activeLesson}
            allLessons={lessons}
            onSelectLesson={(id) => setActiveLessonId(id)}
            onBackToWorkspace={() => setActiveView('workspace')}
          />
        )}

        {activeView === 'editor' && editorDraft && (
          <LessonEditor
            initialLesson={editorDraft.lesson}
            isNew={editorDraft.isNew}
            onSave={handleSaveEditor}
            onCancel={() => {
              setEditorDraft(null);
              setActiveView(editorDraft.isNew ? 'library' : 'workspace');
            }}
          />
        )}
      </main>
    </div>
  );
}
