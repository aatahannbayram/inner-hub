import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Lock, Play, GraduationCap, TrendingUp, ExternalLink } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { HeroVideo } from "@/components/HeroVideo";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { StatCardSkeleton, CourseCardSkeleton, LoadingBlock, ErrorState } from "@/components/panel/Skeletons";
import { HeroQuickStat } from "@/components/panel/HeroQuickStat";
import { LessonPlayerModal } from "@/components/panel/LessonPlayerModal";
import { cleanDisplayText } from "@/lib/displayText";
import { useT } from "@/i18n";

type CourseFormat = "vod" | "live" | "hybrid";
type RoomFilter = "mine" | "all";
type CourseCategory = "business" | "product" | "art" | "craft" | "capital" | "ops";
const COURSE_CATEGORIES: Array<CourseCategory | "all"> = [
  "all",
  "business",
  "product",
  "art",
  "craft",
  "capital",
  "ops",
];

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl: string | null;
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
  format: CourseFormat;
  meetUrl: string | null;
  passCost: number;
  category?: CourseCategory | string | null;
  modules: Module[];
}

interface RawLesson {
  id: number;
  title: string;
  durationSeconds: number | null;
  videoUrl: string | null;
  isCompleted: boolean;
  isLocked: boolean;
}

interface RawModule {
  id: number;
  title: string;
  lessons: RawLesson[];
}

interface RawCourse {
  id: number;
  title: string;
  description?: string;
  term?: number;
  progressPct?: number;
  isEnrolled?: boolean;
  format?: CourseFormat;
  meetUrl?: string | null;
  passCost?: number;
  category?: string | null;
  modules?: RawModule[];
}

function formatLessonDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getTargetLesson(course: Course): Lesson | null {
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!lesson.isCompleted && !lesson.isLocked) return lesson;
    }
  }
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!lesson.isLocked) return lesson;
    }
  }
  return null;
}

function lessonPath(courseId: number, lessonId: number) {
  return `/panel/courses/${courseId}/${lessonId}`;
}

function findLessonInCourses(courses: Course[], courseId: number, lessonId: number): Lesson | null {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return null;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

function mapApiCourse(row: RawCourse, t: ReturnType<typeof useT>): Course {
  const modules: Module[] = (row.modules ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      duration: formatLessonDuration(l.durationSeconds),
      isCompleted: l.isCompleted,
      isLocked: l.isLocked,
      videoUrl: l.videoUrl,
    })),
  }));
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalSeconds = (row.modules ?? [])
    .flatMap((m) => m.lessons)
    .reduce((sum, l) => sum + (l.durationSeconds ?? 0), 0);

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    instructor: "inner·hub",
    instructorTitle: row.term ? t("courses.term", { n: row.term }) : t("courses.education"),
    progressPct: row.progressPct ?? 0,
    totalLessons: allLessons.length,
    completedLessons: allLessons.filter((l) => l.isCompleted).length,
    totalDuration: totalSeconds > 0 ? formatLessonDuration(totalSeconds) : "",
    isEnrolled: row.isEnrolled ?? false,
    tag: t("courses.tag"),
    format: row.format ?? "vod",
    meetUrl: row.meetUrl ?? null,
    passCost: row.passCost ?? 0,
    category: row.category ?? null,
    modules,
  };
}

function LessonRow({ courseId, lesson }: { courseId: number; lesson: Lesson }) {
  if (lesson.isLocked) {
    return (
      <div className="flex w-full items-center gap-3 px-4 py-2.5 text-left opacity-40 cursor-not-allowed">
        <Lock className="size-3.5 shrink-0 text-[var(--ink-muted)]" />
        <span className="flex-1 text-xs text-[var(--ink-strong)]">{lesson.title}</span>
        <span className="font-mono text-label text-[var(--ink-muted)]">{lesson.duration}</span>
      </div>
    );
  }

  return (
    <Link
      href={lessonPath(courseId, lesson.id)}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--ink)]/[0.03] cursor-pointer"
    >
      {lesson.isCompleted ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-[var(--success-ink)]" />
      ) : (
        <Play className="size-3.5 shrink-0 text-[var(--ink-body)]" />
      )}
      <span className="flex-1 text-xs text-[var(--ink-strong)]">{lesson.title}</span>
      <span className="font-mono text-label text-[var(--ink-muted)]">{lesson.duration}</span>
    </Link>
  );
}

function ModuleAccordion({
  courseId,
  module,
  defaultOpen = false,
}: {
  courseId: number;
  module: Module;
  defaultOpen?: boolean;
}) {
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
        <span className="font-mono text-label text-[var(--ink-muted)]">
          {completed}/{module.lessons.length}
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.015]">
          {module.lessons.map((lesson) => (
            <LessonRow key={lesson.id} courseId={courseId} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  busy,
  onEnrollAndStart,
}: {
  course: Course;
  busy?: boolean;
  onEnrollAndStart?: (course: Course) => void;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const targetLesson = getTargetLesson(course);
  const startHref = targetLesson ? lessonPath(course.id, targetLesson.id) : null;

  return (
    <div className="group relative overflow-hidden panel-glass transition-all duration-200 hover:border-[var(--ink)]/15">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-[var(--inner-green)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />
      {/* Card header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span lang="en" className="panel-glass px-1.5 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {course.tag}
              </span>
              <span lang="en" className="panel-glass px-1.5 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {course.format}
              </span>
              {!course.isEnrolled && (
                <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                  {t("courses.enrollRequired")}
                </span>
              )}
              {!course.isEnrolled && course.format !== "vod" && course.passCost > 0 && (
                <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                  {t("courses.passCostHint", { n: course.passCost })}
                </span>
              )}
            </div>
            <h3
              className="font-serif text-xl text-[var(--ink)] leading-snug sm:text-2xl"
              style={{ fontWeight: 600 }}
            >
              {cleanDisplayText(course.title)}
            </h3>
            {course.description ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)] line-clamp-2">
                {course.description}
              </p>
            ) : null}
          </div>

          {/* Progress ring area */}
          <div className="shrink-0 sm:text-right">
            <p className="font-mono text-2xl tabular-nums text-[var(--ink)]">
              %{course.progressPct}
            </p>
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {t("courses.completed")}
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
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 text-xs text-[var(--ink-muted)]">
          <p>
            <span lang="en">{course.instructor}</span>
            {course.instructorTitle ? (
              <>
                {" · "}
                <span className="font-mono text-label uppercase tracking-widest">{course.instructorTitle}</span>
              </>
            ) : null}
          </p>
          {(course.totalLessons > 0 || course.totalDuration) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-label uppercase tracking-widest">
              {course.totalLessons > 0 && (
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3" />
                  {t("courses.lessons", { done: course.completedLessons, total: course.totalLessons })}
                </span>
              )}
              {course.totalDuration ? <span>{course.totalDuration}</span> : null}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          {course.isEnrolled && course.meetUrl ? (
            <a
              href={course.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
            >
              {t("courses.joinMeet")}
              <ExternalLink className="size-3" />
            </a>
          ) : null}
          {course.isEnrolled && startHref ? (
            <Link
              href={startHref}
              className="flex items-center gap-2 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
            >
              {course.progressPct > 0 ? t("courses.continue") : t("courses.start")}
              <ChevronRight className="size-3" />
            </Link>
          ) : course.isEnrolled ? null : (
            <button
              type="button"
              disabled={busy || !targetLesson}
              onClick={() => onEnrollAndStart?.(course)}
              className="flex items-center gap-2 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {targetLesson ? t("courses.start") : t("courses.enroll")}
              <ChevronRight className="size-3" />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="hit-40 relative flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] hover:text-[var(--ink)] transition-colors"
          >
            {expanded ? t("courses.hide") : t("courses.viewCurriculum")}
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
            <p className="px-4 py-3 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {t("courses.curriculumSoon")}
            </p>
          ) : (
            course.modules.map((mod, i) => (
              <ModuleAccordion key={mod.id} courseId={course.id} module={mod} defaultOpen={i === 0} />
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

function CoursesHero({
  hasEnrolled,
  enrolledCount,
  totalCount,
}: {
  hasEnrolled: boolean;
  enrolledCount: number;
  totalCount: number;
}) {
  const t = useT();
  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
    >
      <HeroVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
        poster="/posters/courses-hero.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* backdrop-blur-xl yerine deterministik gradient scrim - altta duran
          metin için yeterli kontrast, blur'un sürekli GPU maliyeti olmadan. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[var(--ink-fixed)]/40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[var(--ink-fixed)]/85 via-[var(--ink-fixed)]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[var(--ink-fixed)]/55 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-label uppercase tracking-widest text-white/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              {t("courses.heroEyebrow")}
            </p>
            <AnimatedHeading
              text={t("courses.heroHeadline")}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                {t("courses.heroBody")}
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {hasEnrolled && (
                  <button
                    onClick={() => scrollToId("courses-enrolled")}
                    className="group inline-flex min-h-11 items-center gap-2 bg-[var(--bone-fixed)] px-6 py-3 font-mono text-sm uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-90 sm:px-8"
                  >
                    {t("courses.continueCta")}
                    <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                )}
                <button
                  onClick={() => scrollToId("courses-available")}
                  className={
                    hasEnrolled
                      ? "liquid-glass group inline-flex min-h-11 items-center gap-2 border border-[var(--bone-fixed)]/25 px-6 py-3 font-mono text-sm uppercase tracking-widest text-[var(--bone-fixed)] transition-colors hover:bg-[var(--bone-fixed)] hover:text-[var(--ink-fixed)] sm:px-8"
                      : "group inline-flex min-h-11 items-center gap-2 bg-[var(--bone-fixed)] px-6 py-3 font-mono text-sm uppercase tracking-widest text-[var(--ink-fixed)] transition-opacity hover:opacity-90 sm:px-8"
                  }
                >
                  {t("courses.exploreCta")}
                  <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <HeroQuickStat
              value={totalCount > 0 ? `${enrolledCount}/${totalCount}` : "-"}
              label={t("courses.heroStat")}
              tagline={t("courses.heroTagline")}
            />
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
    <div className="panel-glass p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="font-serif text-2xl text-[var(--ink)]"
        style={{ fontWeight: 600 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-label text-[var(--ink-muted)]">{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const params = useParams<{ courseId?: string; lessonId?: string }>();
  const routeCourseId = params.courseId ? Number(params.courseId) : null;
  const routeLessonId = params.lessonId ? Number(params.lessonId) : null;
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [passRequired, setPassRequired] = useState(false);
  const [room, setRoom] = useState<RoomFilter>(() => {
    const p = new URLSearchParams(window.location.search).get("room");
    return p === "all" ? "all" : "mine";
  });
  const [category, setCategory] = useState<CourseCategory | "all">("all");

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("room", room);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [room]);

  const { data, isLoading, isError, error, refetch } = useApiQuery<{ courses: RawCourse[] }>(
    ["courses", room],
    `/api/courses?room=${room}`,
  );
  const coursesAll = (data?.courses ?? []).map((row) => mapApiCourse(row, t));
  const hasCategoryField = coursesAll.some((c) => Boolean(c.category));
  const courses =
    category === "all" || !hasCategoryField
      ? coursesAll
      : coursesAll.filter((c) => c.category === category);
  const loading = isLoading;

  const enrolled = courses.filter((c) => c.isEnrolled);
  const available = courses.filter((c) => !c.isEnrolled);
  const avgProgress =
    enrolled.length > 0
      ? Math.round(enrolled.reduce((sum, c) => sum + c.progressPct, 0) / enrolled.length)
      : null;

  const enroll = async (id: number): Promise<boolean> => {
    setBusyId(id);
    setActionError(null);
    setPassRequired(false);
    try {
      const res = await fetch(apiUrl(`/api/courses/${id}/enroll`), {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setPassRequired(true);
        setActionError(t("courses.passRequired"));
        return false;
      }
      if (!res.ok) throw new Error(json.error ?? t("courses.enrollFailed"));
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      return true;
    } catch (e: any) {
      setActionError(e.message ?? t("courses.enrollFailed"));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const enrollAndStart = async (course: Course) => {
    const target = getTargetLesson(course);
    if (!target) {
      await enroll(course.id);
      return;
    }
    if (!course.isEnrolled) {
      const ok = await enroll(course.id);
      if (!ok) return;
    }
    setLocation(lessonPath(course.id, target.id));
  };

  const activeLesson =
    routeCourseId && routeLessonId && Number.isFinite(routeCourseId) && Number.isFinite(routeLessonId)
      ? findLessonInCourses(courses, routeCourseId, routeLessonId)
      : null;

  const closeLesson = () => setLocation("/panel/courses");

  return (
    <div className="min-w-0 space-y-8 max-w-4xl overflow-x-hidden">
      {/* Hero */}
      <CoursesHero
        hasEnrolled={enrolled.length > 0}
        enrolledCount={enrolled.length}
        totalCount={courses.length}
      />

      <FadeIn delay={0.01}>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex w-full max-w-xs panel-glass sm:w-auto">
            {(["mine", "all"] as RoomFilter[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoom(r)}
                className={[
                  "min-h-10 flex-1 px-4 py-2 font-mono text-label uppercase tracking-widest transition-colors sm:flex-none",
                  room === r
                    ? "bg-[var(--ink)] text-[var(--bone)]"
                    : "text-[var(--ink-body)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {r === "mine" ? t("courses.roomMine") : t("courses.roomAll")}
              </button>
            ))}
          </div>
          {hasCategoryField ? (
            <div className="flex flex-wrap gap-1.5">
              {COURSE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={[
                    "border px-2.5 py-1.5 font-mono text-label uppercase tracking-widest transition-colors",
                    category === c
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                      : "border-[var(--ink)]/15 text-[var(--ink-muted)] hover:text-[var(--ink)]",
                  ].join(" ")}
                >
                  {c === "all" ? (
                    t("common.all")
                  ) : (
                    <span lang="en">{t(`courses.category.${c}`)}</span>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </FadeIn>

      {!loading && !isError && courses.length > 0 && (
        <FadeIn delay={0.02}>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
            <CoursesStat label={t("courses.statEnrolled")} value={String(enrolled.length)} sub={t("courses.statEnrolledSub")} icon={GraduationCap} />
            <CoursesStat label={t("courses.statProgress")} value={avgProgress !== null ? `%${avgProgress}` : "·"} sub={t("courses.statProgressSub")} icon={TrendingUp} />
            <CoursesStat label={t("courses.statOther")} value={String(available.length)} sub={t("courses.statOtherSub")} icon={BookOpen} />
            <CoursesStat label={t("courses.statTotal")} value={String(courses.length)} sub={t("courses.statTotalSub")} icon={Play} />
          </div>
        </FadeIn>
      )}

      {loading && (
        <LoadingBlock label={t("courses.loading")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      )}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : t("courses.loadError")}
          onRetry={() => refetch()}
        />
      )}
      {actionError && (
        <div className="panel-glass space-y-2 p-4" role="alert">
          <p className="font-mono text-label text-[var(--error-ink)]">{actionError}</p>
          {passRequired && (
            <Link
              href="/panel/membership"
              className="inline-block font-mono text-label uppercase tracking-widest text-[var(--ink)] underline-offset-4 hover:underline"
            >
              {t("courses.getPass")}
            </Link>
          )}
        </div>
      )}
      {!loading && !isError && courses.length === 0 && (
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
          {t("courses.empty")}
        </p>
      )}

      {enrolled.length > 0 && (
        <FadeIn delay={0.05}>
          <section id="courses-enrolled" className="scroll-mt-6">
            <div className="mb-3 flex items-center gap-3 border-t border-[var(--ink)]/[0.08] pt-3">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {t("courses.myEnrolled")}
              </p>
              <span className="flex size-4 items-center justify-center bg-[var(--ink)] font-mono text-label text-[var(--bone)]">
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
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {t("courses.otherCourses")}
              </p>
            </div>
            <div className="space-y-3 opacity-80">
              {available.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  busy={busyId === course.id}
                  onEnrollAndStart={enrollAndStart}
                />
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {activeLesson && routeCourseId && routeLessonId && (
        <LessonPlayerModal
          lesson={activeLesson}
          onClose={closeLesson}
          onCompleted={() => void queryClient.invalidateQueries({ queryKey: ["courses"] })}
        />
      )}
    </div>
  );
}
