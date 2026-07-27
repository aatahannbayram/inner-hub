import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, Loader2, ChevronDown, ChevronRight, Check } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import { useT } from "@/i18n";

type AdminLesson = {
  id: number;
  title: string;
  durationSeconds: number | null;
  videoUrl: string | null;
};
type AdminModule = { id: number; title: string; lessons: AdminLesson[] };
type AdminCourse = {
  id: number;
  title: string;
  description: string;
  term: number;
  order: number;
  isPublished: boolean;
  modules: AdminModule[];
};

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function VideoUploader({
  onReady,
}: {
  onReady: (playbackId: string, durationSeconds: number | null) => void;
}) {
  const t = useT();
  const [state, setState] = useState<"idle" | "uploading" | "processing" | "ready" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setState("uploading");
    setError(null);
    try {
      const createRes = await fetch(apiUrl("/api/mux/uploads"), {
        method: "POST",
        credentials: "include",
      });
      const createJson = await createRes.json().catch(() => ({}));
      if (!createRes.ok) throw new Error(createJson.error ?? t("courses.uploadFailed"));

      const putRes = await fetch(createJson.uploadUrl, { method: "PUT", body: file });
      if (!putRes.ok) throw new Error(t("courses.uploadFailed"));

      setState("processing");
      const uploadId = createJson.uploadId as string;
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(apiUrl(`/api/mux/uploads/${uploadId}`), { credentials: "include" });
        const pollJson = await pollRes.json().catch(() => ({}));
        if (!pollRes.ok) throw new Error(pollJson.error ?? t("courses.uploadFailed"));
        if (pollJson.status === "ready") {
          setState("ready");
          onReady(pollJson.playbackId, pollJson.durationSeconds ?? null);
          return;
        }
        if (pollJson.status === "errored") throw new Error(t("courses.uploadFailed"));
      }
      throw new Error(t("courses.uploadFailed"));
    } catch (e: any) {
      setState("error");
      setError(e.message ?? t("courses.uploadFailed"));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="hit-40 flex cursor-pointer items-center gap-2 panel-glass px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/30">
        {state === "uploading" || state === "processing" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : state === "ready" ? (
          <Check className="size-3.5 text-[var(--success-ink)]" />
        ) : (
          <Upload className="size-3.5" />
        )}
        {state === "uploading"
          ? t("courses.uploading")
          : state === "processing"
            ? t("courses.processingVideo")
            : state === "ready"
              ? fileName
              : t("courses.chooseVideo")}
        <input
          type="file"
          accept="video/*"
          className="sr-only"
          disabled={state === "uploading" || state === "processing"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </label>
      {error && <span className="text-xs text-[var(--error-ink)]">{error}</span>}
    </div>
  );
}

function AddLessonForm({ moduleId, onAdded }: { moduleId: number; onAdded: () => void }) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/modules/${moduleId}/lessons`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: content || undefined, videoUrl, durationSeconds }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("courses.saveFailed"));
      setTitle("");
      setContent("");
      setVideoUrl(null);
      setDurationSeconds(null);
      onAdded();
    } catch (e: any) {
      setError(e.message ?? t("courses.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-[var(--ink)]/[0.06] p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("courses.lessonTitlePlaceholder")}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("courses.lessonContentPlaceholder")}
        rows={2}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <VideoUploader
        onReady={(pid, dur) => {
          setVideoUrl(pid);
          setDurationSeconds(dur);
        }}
      />
      {error && <p className="text-xs text-[var(--error-ink)]">{error}</p>}
      <button
        type="button"
        disabled={busy || !title.trim()}
        onClick={() => void submit()}
        className="flex items-center gap-1.5 panel-glass-ink px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        <Plus className="size-3" />
        {t("courses.addLesson")}
      </button>
    </div>
  );
}

function AddModuleForm({ courseId, onAdded }: { courseId: number; onAdded: () => void }) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/courses/${courseId}/modules`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setTitle("");
        onAdded();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("courses.moduleTitlePlaceholder")}
        className="flex-1 border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <button
        type="button"
        disabled={busy || !title.trim()}
        onClick={() => void submit()}
        className="flex items-center gap-1.5 panel-glass px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/30 disabled:opacity-40"
      >
        <Plus className="size-3" />
        {t("courses.addModule")}
      </button>
    </div>
  );
}

function ModuleAdminRow({ courseModule, onChanged }: { courseModule: AdminModule; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[var(--ink)]/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[var(--ink)]/[0.02]"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0 text-[var(--ink-body)]" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-[var(--ink-body)]" />
        )}
        <span className="flex-1 text-xs font-medium text-[var(--ink)]">{courseModule.title}</span>
        <span className="font-mono text-label text-[var(--ink-muted)]">{courseModule.lessons.length}</span>
      </button>
      {open && (
        <div className="bg-[var(--ink)]/[0.015]">
          {courseModule.lessons.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2 text-xs text-[var(--ink-body)]">
              <span
                aria-hidden
                className={l.videoUrl ? "text-[var(--success-ink)]" : "text-[var(--ink-muted)]"}
              >
                ●
              </span>
              <span className="flex-1">{l.title}</span>
              <span className="font-mono text-label text-[var(--ink-muted)]">
                {formatDuration(l.durationSeconds)}
              </span>
            </div>
          ))}
          <AddLessonForm moduleId={courseModule.id} onAdded={onChanged} />
        </div>
      )}
    </div>
  );
}

function CourseAdminCard({ course, onChanged }: { course: AdminCourse; onChanged: () => void }) {
  const t = useT();
  const totalLessons = course.modules.reduce((n, m) => n + m.lessons.length, 0);

  const togglePublish = async () => {
    await fetch(apiUrl(`/api/courses/${course.id}`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    onChanged();
  };

  return (
    <div className="panel-glass">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-serif text-lg text-[var(--ink)]">{course.title}</p>
          <p className="mt-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("courses.term", { n: course.term })} · {totalLessons} {t("courses.lessonsCount")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void togglePublish()}
          className={`px-2 py-0.5 font-mono text-label uppercase tracking-widest ${
            course.isPublished
              ? "border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/8 text-[var(--success-ink)]"
              : "border border-[var(--ink)]/20 bg-[var(--ink)]/[0.04] text-[var(--ink-body)]"
          }`}
        >
          {course.isPublished ? t("courses.published") : t("courses.draft")}
        </button>
      </div>
      {course.modules.map((m) => (
        <ModuleAdminRow key={m.id} courseModule={m} onChanged={onChanged} />
      ))}
      <AddModuleForm courseId={course.id} onAdded={onChanged} />
    </div>
  );
}

function AddCourseForm({ onAdded }: { onAdded: () => void }) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState(1);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/courses"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, term, isPublished: false }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        onAdded();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel-glass space-y-3 p-4">
      <p className="font-mono text-label uppercase tracking-widest text-[var(--ink)]">
        {t("courses.addCourse")}
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("courses.courseTitlePlaceholder")}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("courses.courseDescriptionPlaceholder")}
        rows={2}
        className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
      />
      <div className="flex items-center gap-3">
        <label className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          {t("courses.term", { n: term })}
        </label>
        <input
          type="number"
          min={1}
          value={term}
          onChange={(e) => setTerm(Number(e.target.value) || 1)}
          className="w-16 border border-[var(--ink)]/15 bg-transparent px-2 py-1 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40"
        />
      </div>
      <button
        type="button"
        disabled={busy || !title.trim()}
        onClick={() => void submit()}
        className="flex items-center gap-1.5 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        <Plus className="size-3" />
        {t("courses.addCourse")}
      </button>
    </div>
  );
}

export default function CoursesAdmin() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useApiQuery<{ courses: AdminCourse[] }>(
    ["courses-admin"],
    "/api/courses/admin",
  );
  const courses = data?.courses ?? [];

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["courses-admin"] });

  return (
    <div className="min-w-0 max-w-2xl space-y-6">
      <FadeIn>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("courses.adminEyebrow")}
            </span>
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("courses.adminTitle")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("courses.adminSubtitle")}</p>
        </div>
      </FadeIn>

      {isLoading ? (
        <LoadingBlock label={t("courses.loading")}>
          <div className="space-y-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : isError ? (
        <ErrorState message={t("courses.loadFailed")} onRetry={() => refetch()} />
      ) : (
        <FadeIn delay={0.05}>
          <div className="space-y-3">
            {courses.map((c) => (
              <CourseAdminCard key={c.id} course={c} onChanged={refresh} />
            ))}
            <AddCourseForm onAdded={refresh} />
          </div>
        </FadeIn>
      )}
    </div>
  );
}
