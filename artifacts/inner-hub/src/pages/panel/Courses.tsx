import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Lock, Play } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { apiUrl } from "@/lib/api";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructorTitle: string;
  progressPct: number;
  totalLessons: number;
  completedLessons: number;
  totalDuration: string;
  isEnrolled: boolean;
  tag: string;
  modules: Module[];
}

function mapApiCourse(row: {
  id: number;
  title: string;
  description?: string;
  term?: number;
  progressPct?: number;
  isEnrolled?: boolean;
}): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    instructor: "inner·hub",
    instructorTitle: row.term ? `Dönem ${row.term}` : "Eğitim",
    progressPct: row.progressPct ?? 0,
    totalLessons: 0,
    completedLessons: 0,
    totalDuration: "—",
    isEnrolled: row.isEnrolled ?? false,
    tag: "Kurs",
    modules: [],
  };
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-2.5 transition-colors",
        lesson.isLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--ink)]/[0.03] cursor-pointer",
      ].join(" ")}
    >
      {lesson.isCompleted ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-[var(--inner-green)]" />
      ) : lesson.isLocked ? (
        <Lock className="size-3.5 shrink-0 text-[var(--ink)]/30" />
      ) : (
        <Play className="size-3.5 shrink-0 text-[var(--ink)]/40" />
      )}
      <span className="flex-1 text-xs text-[var(--ink)]/70">{lesson.title}</span>
      <span className="font-mono text-[9px] text-[var(--ink)]/30">{lesson.duration}</span>
    </div>
  );
}

function ModuleAccordion({ module, defaultOpen = false }: { module: Module; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const completed = module.lessons.filter((l) => l.isCompleted).length;

  return (
    <div className="border-b border-[var(--ink)]/[0.08] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--ink)]/[0.02]"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0 text-[var(--ink)]/40" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-[var(--ink)]/40" />
        )}
        <span className="flex-1 text-xs font-medium text-[var(--ink)]">{module.title}</span>
        <span className="font-mono text-[9px] text-[var(--ink)]/30">
          {completed}/{module.lessons.length}
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.015]">
          {module.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[var(--ink)]/[0.08] transition-all duration-200 hover:border-[var(--ink)]/15">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30 border border-[var(--ink)]/10 px-1.5 py-0.5">
                {course.tag}
              </span>
              {!course.isEnrolled && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
                  Kayıt gerekli
                </span>
              )}
            </div>
            <h3
              className="font-serif text-xl text-[var(--ink)] leading-snug"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
            >
              {course.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--ink)]/50 leading-relaxed line-clamp-2">
              {course.description}
            </p>
          </div>

          {/* Progress ring area */}
          <div className="shrink-0 text-right">
            <p className="font-mono text-2xl tabular-nums text-[var(--ink)]">
              %{course.progressPct}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              tamamlandı
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {course.isEnrolled && (
          <div className="mt-4 h-px w-full bg-[var(--ink)]/10">
            <div
              className="h-full bg-[var(--inner-green)] transition-all duration-700"
              style={{ width: `${course.progressPct}%` }}
            />
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-[var(--ink)]/60">{course.instructor}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
              {course.instructorTitle}
            </p>
          </div>
          <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/30">
            <span className="flex items-center gap-1">
              <BookOpen className="size-3" />
              {course.completedLessons}/{course.totalLessons} ders
            </span>
            <span>{course.totalDuration}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          {course.isEnrolled ? (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80"
            >
              {course.progressPct > 0 ? "Devam Et" : "Başla"}
              <ChevronRight className="size-3" />
            </button>
          ) : (
            <button className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80">
              Kayıt Ol
              <ChevronRight className="size-3" />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 hover:text-[var(--ink)] transition-colors"
          >
            {expanded ? "Gizle" : "Müfredatı Gör"}
            {expanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </button>
        </div>
      </div>

      {/* Curriculum accordion */}
      {expanded && (
        <div className="border-t border-[var(--ink)]/[0.08]">
          {course.modules.length === 0 ? (
            <p className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
              Müfredat yakında yayınlanacak.
            </p>
          ) : (
            course.modules.map((mod, i) => (
              <ModuleAccordion key={mod.id} module={mod} defaultOpen={i === 0} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiUrl("/api/courses"), { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Kurslar yüklenemedi");
        if (!cancelled) setCourses((json.courses ?? []).map(mapApiCourse));
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Kurslar yüklenemedi");
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enrolled = courses.filter((c) => c.isEnrolled);
  const available = courses.filter((c) => !c.isEnrolled);

  return (
    <div className="space-y-8 max-w-3xl">
      <FadeIn>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
            inner·hub
          </p>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            Kurslarım
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            inner·hub eğitim içerikleri — kendi hızında, kendi zamanında.
          </p>
        </div>
      </FadeIn>

      {loading && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
          Yükleniyor…
        </p>
      )}
      {error && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
          {error}
        </p>
      )}
      {!loading && !error && courses.length === 0 && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
          Henüz yayınlanmış kurs yok.
        </p>
      )}

      {enrolled.length > 0 && (
        <FadeIn delay={0.05}>
          <section>
            <div className="mb-3 flex items-center gap-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Kayıtlı Kurslarım
              </p>
              <span className="flex size-4 items-center justify-center bg-[var(--ink)] font-mono text-[9px] text-[var(--bone)]">
                {enrolled.length}
              </span>
            </div>
            <div className="space-y-3">
              {enrolled.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {available.length > 0 && (
        <FadeIn delay={0.1}>
          <section>
            <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
                Diğer Kurslar
              </p>
            </div>
            <div className="space-y-3 opacity-80">
              {available.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
