import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Check } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import { apiUrl } from "@/lib/api";
import { useT } from "@/i18n";

export function LessonPlayerModal({
  lesson,
  onClose,
  onCompleted,
}: {
  lesson: { id: number; title: string; videoUrl: string | null; isCompleted: boolean };
  onClose: () => void;
  onCompleted: () => void;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(lesson.isCompleted);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const markComplete = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/lessons/${lesson.id}/complete`), {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("courses.markCompleteFailed"));
      setCompleted(true);
      onCompleted();
    } catch (e: any) {
      setError(e.message ?? t("courses.markCompleteFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ink-fixed)]/75 p-4"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        onClick={onClose}
      >
        <button
          type="button"
          className="hit-40 absolute right-4 top-4 text-[var(--bone-fixed)]/70 hover:text-[var(--bone-fixed)]"
          onClick={onClose}
          aria-label={t("common.close")}
        >
          <X className="size-5" />
        </button>
        <motion.div
          className="w-full max-w-3xl overflow-hidden border border-[var(--bone-fixed)]/10 bg-[var(--ink-fixed)]"
          onClick={(e) => e.stopPropagation()}
          initial={reduce ? false : { scale: 0.97 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {lesson.videoUrl ? (
            <MuxPlayer
              playbackId={lesson.videoUrl}
              metadata={{ video_title: lesson.title }}
              streamType="on-demand"
              autoPlay
              className="w-full"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center text-sm text-[var(--bone-fixed)]/50">
              {t("courses.noVideo")}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-[var(--bone-fixed)]">{lesson.title}</p>
            {error && <p className="text-xs text-[var(--error-ink)]">{error}</p>}
            <button
              type="button"
              disabled={busy || completed}
              onClick={() => void markComplete()}
              className="flex items-center gap-1.5 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-60"
            >
              <Check className="size-3" />
              {completed ? t("courses.completedLabel") : t("courses.markComplete")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
