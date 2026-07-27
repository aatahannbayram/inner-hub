"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, X, Bell, ChevronLeft, ChevronRight, Sparkles, CalendarDays, TrendingUp, UserPlus, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PanelNav } from "./PanelNav";
import { PanelPageTransition } from "./PanelPageTransition";
import { PanelOnboarding } from "./PanelOnboarding";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { Lockup } from "@/components/Lockup";
import { LocaleSyncFromSettings, useLocale, useT } from "@/i18n";
import { ThemeSyncFromSettings } from "@/components/ThemeSyncFromSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PanelAmbient } from "@/components/panel/PanelAmbient";

// ─── Notifications ────────────────────────────────────────────────────────────

type NotifKind = "match" | "event" | "capital" | "request" | "signal";

type ApiNotif = {
  id: number;
  title: string;
  body: string;
  kind: NotifKind;
  isRead: boolean;
  createdAt: string;
};

const NOTIF_ICONS: Record<NotifKind, React.ComponentType<{ className?: string }>> = {
  match: Sparkles,
  event: CalendarDays,
  capital: TrendingUp,
  request: UserPlus,
  signal: Zap,
};

function relativeTime(
  iso: string,
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: string,
): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return t("shell.justNow");
  if (m < 60) return t("shell.minutesAgo", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t("shell.hoursAgo", { n: h });
  const d = Math.floor(h / 24);
  if (d < 7) return t("shell.daysAgo", { n: d });
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function NotifPanel({
  onClose,
  count,
  onClear,
}: {
  onClose: () => void;
  count: number;
  onClear: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useApiQuery<{
    notifications: ApiNotif[];
    unreadCount: number;
  }>(["notifications"], "/api/notifications");
  const notifs = data?.notifications ?? [];
  const [busy, setBusy] = useState(false);

  const markAll = async () => {
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/notifications/read-all"), {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("okunamadı");
      onClear();
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const markOne = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/notifications/${id}/read`), {
        method: "PATCH",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;
      if (typeof json.unreadCount === "number" && json.unreadCount === 0) onClear();
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="panel-glass-strong fixed right-4 top-[68px] z-50 w-80 shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("shell.notifications")}
            </p>
            {count > 0 && (
              <span className="flex size-4 items-center justify-center bg-[var(--ink)] font-mono text-label text-[var(--bone)]">
                {count}
              </span>
            )}
          </div>
          {count > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void markAll()}
              className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
            >
              {t("shell.markAllRead")}
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading && notifs.length === 0 && (
            <p className="px-4 py-6 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              Yükleniyor…
            </p>
          )}
          {isError && (
            <button
              type="button"
              onClick={() => refetch()}
              className="w-full px-4 py-6 text-left font-mono text-label uppercase tracking-widest text-[var(--error-ink)]"
            >
              Yüklenemedi · tekrar dene
            </button>
          )}
          {!isLoading && !isError && notifs.length === 0 && (
            <p className="px-4 py-6 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {t("shell.noNotifications")}
            </p>
          )}
          {notifs.map((n) => {
            const Icon = NOTIF_ICONS[n.kind] ?? Zap;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.isRead) void markOne(n.id);
                }}
                className={cn(
                  "flex w-full gap-3 border-b border-[var(--ink)]/[0.05] px-4 py-3 text-left transition-colors last:border-0",
                  !n.isRead && "bg-[var(--ink)]/[0.025]",
                )}
              >
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center bg-[var(--ink)]/[0.06]">
                  <Icon className="size-3.5 text-[var(--ink-body)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-light leading-snug text-[var(--ink)]">{n.title}</p>
                    {!n.isRead && (
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--inner-green)]" />
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-label leading-snug text-[var(--ink-muted)]">{n.body}</p>
                  <p className="mt-1 font-mono text-label text-[var(--ink-subtle)]">
                    {relativeTime(n.createdAt, t, locale)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-[var(--ink)]/[0.08] px-4 py-2.5">
          <p className="text-center font-mono text-label text-[var(--ink-subtle)]">inner·hub · bildirimler</p>
        </div>
      </div>
    </>
  );
}

// ─── Sidebar context ──────────────────────────────────────────────────────────
type SidebarCtx = { collapsed: boolean; toggle: () => void };
const SidebarContext = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("inner_sidebar") === "collapsed"; } catch { return false; }
  });

  const toggle = () =>
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem("inner_sidebar", next ? "collapsed" : "open"); } catch {}
      return next;
    });

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Brand mark ───────────────────────────────────────────────────────────────
function BrandMark({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex size-8 items-center justify-center text-[var(--ink)]">
        <Lockup compact fontSize="18px" className="text-[var(--ink)]" />
      </div>
    );
  }
  return <Lockup className="text-[var(--ink)]" fontSize="20px" />;
}

// ─── Sidebar footer ───────────────────────────────────────────────────────────
function SidebarFooter({
  user,
  collapsed,
  onLogout,
}: {
  user: PanelUser & { profileCompletionPct: number };
  collapsed: boolean;
  onLogout?: () => void;
}) {
  const t = useT();
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full justify-center p-2 text-[var(--ink-body)] transition-colors hover:text-[var(--ink)]"
        title={t("common.logoutLong")}
      >
        <LogOut className="size-4" />
      </button>
    );
  }
  return (
    <div className="space-y-3">
          <div className="space-y-0.5">
        <p className="truncate text-sm font-medium text-[var(--ink)] dark:text-[#F4F1EC]">{user.name}</p>
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] dark:text-white/45">
          {user.role === "admin" ? t("common.admin") : t("common.member")}
        </p>
      </div>
      {user.profileCompletionPct < 100 && (
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="font-mono text-label font-semibold uppercase tracking-widest text-[var(--ink-strong)] dark:text-white/55">
              {t("shell.profileCompletion")}
            </span>
            <span className="font-mono text-label font-semibold tabular-nums text-[var(--ink-strong)] dark:text-white/55">
              %{user.profileCompletionPct}
            </span>
          </div>
          <div className="relative h-1 w-full overflow-visible bg-[var(--ink)]/10 dark:bg-white/10">
            <div
              className="h-full bg-[var(--inner-green)] shadow-[0_0_6px_var(--inner-green)] transition-all duration-700"
              style={{ width: `${user.profileCompletionPct}%` }}
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        className="hit-40 relative flex items-center gap-1.5 text-[var(--ink-body)] transition-colors hover:text-[var(--ink)] dark:text-white/50 dark:hover:text-white"
      >
        <LogOut className="size-3.5" />
        <span className="font-mono text-label uppercase tracking-widest">{t("common.logoutLong")}</span>
      </button>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type PanelUser = {
  name: string;
  email: string;
  role: "member" | "admin";
  avatarUrl?: string;
  profileCompletionPct?: number;
  notificationCount?: number;
};

type PanelShellProps = {
  user: PanelUser;
  children: React.ReactNode;
  onLogout?: () => void;
};

// ─── Desktop sidebar ──────────────────────────────────────────────────────────
function DesktopSidebar({ user, onLogout }: { user: PanelUser; onLogout?: () => void }) {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      data-onboarding="nav"
      className={cn(
        "relative z-[1] hidden h-full shrink-0 flex-col border-r border-[var(--ink)]/[0.08] panel-glass-strong transition-all duration-300 ease-expo lg:flex dark:border-white/10",
        collapsed ? "w-[56px]" : "w-[220px] xl:w-[240px]",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-[60px] items-center border-b border-[var(--ink)]/[0.08] px-4 dark:border-white/10",
          collapsed && "justify-center px-0",
        )}
      >
        <Link href="/panel">
          <BrandMark collapsed={collapsed} />
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-2">
        <PanelNav role={user.role} collapsed={collapsed} />
      </div>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-[var(--ink)]/[0.08] p-4 dark:border-white/10",
          collapsed && "flex justify-center p-2",
        )}
      >
        <SidebarFooter user={{ ...user, profileCompletionPct: user.profileCompletionPct ?? 0 }} collapsed={collapsed} onLogout={onLogout} />
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className="hit-40 panel-glass absolute -right-3 top-[72px] z-10 flex size-6 items-center justify-center text-[var(--ink-body)] transition-colors hover:text-[var(--ink)] dark:border-white/15 dark:text-white/55 dark:hover:text-white"
        aria-label={collapsed ? "Sidebar'ı genişlet" : "Sidebar'ı daralt"}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  );
}

// ─── Mobile nav drawer ────────────────────────────────────────────────────────
function MobileDrawer({
  open,
  onClose,
  user,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  user: PanelUser;
  onLogout?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[var(--ink-fixed)]/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="panel-glass-strong fixed inset-y-0 left-0 z-[90] flex w-[min(280px,85vw)] flex-col border-r border-[var(--ink)]/[0.08] lg:hidden"
          >
            <div className="flex h-[60px] items-center justify-between border-b border-[var(--ink)]/[0.08] px-4">
              <BrandMark collapsed={false} />
              <button type="button" onClick={onClose} className="text-[var(--ink-body)] hover:text-[var(--ink)]">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2" onClick={onClose}>
              <PanelNav role={user.role} collapsed={false} />
            </div>
            <div className="border-t border-[var(--ink)]/[0.08] p-4">
              <SidebarFooter user={{ ...user, profileCompletionPct: user.profileCompletionPct ?? 0 }} collapsed={false} onLogout={onLogout} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
// Route → scroll pozisyonu haritası (modül seviyesinde, unmount'ta kaybolmaz)
const scrollMap = new Map<string, number>();
let isPopNavigation = false;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    isPopNavigation = true;
  });
}

function ShellInner({ user, children, onLogout }: PanelShellProps) {
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [location] = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const prevLocation = useRef(location);
  const queryClient = useQueryClient();
  const { data: notifData } = useApiQuery<{ notifications: ApiNotif[]; unreadCount: number }>(
    ["notifications"],
    "/api/notifications",
  );
  const notifCount = notifData?.unreadCount ?? user.notificationCount ?? 0;

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    // Ayrılan sayfanın scroll'unu kaydet
    scrollMap.set(prevLocation.current, main.scrollTop);

    if (isPopNavigation && scrollMap.has(location)) {
      main.scrollTop = scrollMap.get(location)!; // geri/ileri: eski pozisyona dön
    } else {
      main.scrollTop = 0; // yeni navigasyon: en üste sıfırla
      main.focus({ preventScroll: true }); // focus'u BODY'de bırakma
    }
    isPopNavigation = false;
    prevLocation.current = location;
  }, [location]);

  return (
    <div className="relative flex h-svh overflow-hidden bg-[var(--bone)] text-[var(--ink)] dark:bg-transparent">
      <PanelAmbient />
      <LocaleSyncFromSettings />
      <ThemeSyncFromSettings />
      <a
        href="#panel-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--ink)] focus:text-[var(--bone)] focus:px-4 focus:py-2"
      >
        {t("common.skipToContent")}
      </a>
      <DesktopSidebar user={user} onLogout={onLogout} />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        onLogout={onLogout}
      />

      <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-[var(--ink)]/[0.08] panel-glass-strong px-3 sm:h-[60px] sm:px-5 lg:px-6 dark:border-white/10">
          <button
            type="button"
            data-onboarding="nav"
            onClick={() => setMobileOpen(true)}
            className="hit-40 relative text-[var(--ink-body)] hover:text-[var(--ink)] lg:hidden"
            aria-label={t("shell.openMenu")}
          >
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <BrandMark collapsed={false} />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {/* Online indicator */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="size-1.5 rounded-full bg-[var(--inner-green)] animate-beacon" />
              <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] dark:text-white/45">
                {t("common.online")}
              </span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              data-onboarding="notifications"
              onClick={() => setNotifOpen((o) => !o)}
              className="hit-40 relative text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] dark:text-white/45 dark:hover:text-white"
              aria-label={t("shell.notifications")}
            >
              <Bell className="size-4" />
              {notifCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center bg-[var(--inner-green)] font-mono text-label text-black">
                  {notifCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <NotifPanel
                onClose={() => setNotifOpen(false)}
                count={notifCount}
                onClear={() => {
                  queryClient.setQueryData(["notifications"], (prev: typeof notifData) =>
                    prev
                      ? {
                          ...prev,
                          unreadCount: 0,
                          notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
                        }
                      : prev,
                  );
                }}
              />
            )}

            {/* Avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="size-7 object-cover"
              />
            ) : (
              <div className="flex size-7 items-center justify-center border border-white/10 bg-[var(--ink)] font-mono text-label uppercase text-[var(--bone)] dark:bg-white/10 dark:text-[#F4F1EC]">
                {user.name.slice(0, 2)}
              </div>
            )}
          </div>
        </header>

        {/* Main content - tek scroll container */}
        <main
          id="panel-main"
          ref={mainRef}
          tabIndex={-1}
          data-onboarding="main"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-5 outline-none sm:px-5 sm:py-6 lg:px-8 lg:py-8 dark:[scrollbar-color:rgba(255,255,255,0.15)_transparent]"
        >
          <PanelPageTransition>{children}</PanelPageTransition>
        </main>
      </div>

      <PanelOnboarding userName={user.name} />
    </div>
  );
}

export function PanelShell(props: PanelShellProps) {
  return (
    <SidebarProvider>
      <ShellInner {...props} />
    </SidebarProvider>
  );
}
