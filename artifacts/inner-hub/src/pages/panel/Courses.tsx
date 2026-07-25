import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Lock, Play, GraduationCap, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
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
        <Lock className="size-3.5 shrink-0 text-[var(--ink-muted)]" />
      ) : (
        <Play className="size-3.5 shrink-0 text-[var(--ink-body)]" />
      )}
      <span className="flex-1 text-xs text-[var(--ink-strong)]">{lesson.title}</span>
      <span className="font-mono text-[9px] text-[var(--ink-muted)]">{lesson.duration}</span>
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
          <ChevronDown className="size-3.5 shrink-0 text-[var(--ink-body)]" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-[var(--ink-body)]" />
        )}
        <span className="flex-1 text-xs font-medium text-[var(--ink)]">{module.title}</span>
        <span className="font-mono text-[9px] text-[var(--ink-muted)]">
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
    <div className="group relative overflow-hidden border border-[var(--ink)]/[0.08] transition-all duration-200 hover:border-[var(--ink)]/15">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-[var(--inner-green)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)] border border-[var(--ink)]/10 px-1.5 py-0.5">
                {course.tag}
              </span>
              {!course.isEnrolled && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
                  Kayıt gerekli
                </span>
              )}
            </div>
            <h3
              className="font-serif text-xl text-[var(--ink)] leading-snug"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
            >
              {course.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed line-clamp-2">
              {course.description}
            </p>
          </div>

          {/* Progress ring area */}
          <div className="shrink-0 text-right">
            <p className="font-mono text-2xl tabular-nums text-[var(--ink)]">
              %{course.progressPct}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
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
            <p className="text-xs text-[var(--ink-body)]">{course.instructor}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
              {course.instructorTitle}
            </p>
          </div>
          <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
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
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] hover:text-[var(--ink)] transition-colors"
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
            <p className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CoursesHero({ hasEnrolled }: { hasEnrolled: boolean }) {
  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />
      <div
        aria-hidden="true"
        className="bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              Kurslarım
            </p>
            <AnimatedHeading
              text={"Where knowledge\nmeets momentum."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                inner·hub eğitim içerikleri — kendi hızında, kendi zamanında, dairenin bilgisiyle.
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-4">
                {hasEnrolled && (
                  <button
                    onClick={() => scrollToId("courses-enrolled")}
                    className="group inline-flex items-center gap-2 bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                  >
                    Devam Et
                    <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                )}
                <button
                  onClick={() => scrollToId("courses-available")}
                  className={
                    hasEnrolled
                      ? "liquid-glass group inline-flex items-center gap-2 border border-white/20 px-8 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                      : "group inline-flex items-center gap-2 bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90"
                  }
                >
                  Kursları Keşfet
                  <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <FadeIn delay={1.4}>
              <div className="liquid-glass border border-white/20 bg-black/40 px-6 py-3">
                <span className="text-lg font-light text-white md:text-xl">
                  Kendi Hızında. Kendi Zamanında.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoursesStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="font-serif text-2xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] text-[var(--ink-muted)]">{sub}</p>
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
  const avgProgress =
    enrolled.length > 0
      ? Math.round(enrolled.reduce((sum, c) => sum + c.progressPct, 0) / enrolled.length)
      : null;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero */}
      <CoursesHero hasEnrolled={enrolled.length > 0} />

      {!loading && !error && courses.length > 0 && (
        <FadeIn delay={0.02}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CoursesStat label="Kayıtlı Kurs" value={String(enrolled.length)} sub="devam ediyor" icon={GraduationCap} />
            <CoursesStat label="Ort. İlerleme" value={avgProgress !== null ? `%${avgProgress}` : "—"} sub="kayıtlı kurslarda" icon={TrendingUp} />
            <CoursesStat label="Diğer Kurslar" value={String(available.length)} sub="keşfedilmeyi bekliyor" icon={BookOpen} />
            <CoursesStat label="Toplam" value={String(courses.length)} sub="inner·hub kataloğu" icon={Play} />
          </div>
        </FadeIn>
      )}

      {loading && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
          Yükleniyor…
        </p>
      )}
      {error && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
          {error}
        </p>
      )}
      {!loading && !error && courses.length === 0 && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
          Henüz yayınlanmış kurs yok.
        </p>
      )}

      {enrolled.length > 0 && (
        <FadeIn delay={0.05}>
          <section id="courses-enrolled" className="scroll-mt-6">
            <div className="mb-3 flex items-center gap-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
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
          <section id="courses-available" className="scroll-mt-6">
            <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">
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
