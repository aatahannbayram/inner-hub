"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, X, Bell, ChevronLeft, ChevronRight, Sparkles, CalendarDays, TrendingUp, UserPlus, Zap, Search, BookOpen, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PanelNav } from "./PanelNav";
import { PanelPageTransition } from "./PanelPageTransition";
import { PanelOnboarding } from "./PanelOnboarding";
import { LegalAcceptModal } from "./LegalAcceptModal";
import { PanelSearch, HeaderIconButton, SearchTriggerBar } from "./PanelSearch";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { Lockup } from "@/components/Lockup";
import { LocaleSyncFromSettings, useLocale, useT } from "@/i18n";
import { ThemeSyncFromSettings } from "@/components/ThemeSyncFromSettings";
import { PanelAmbient } from "@/components/panel/PanelAmbient";
import { createPortal } from "react-dom";

// ─── Notifications ────────────────────────────────────────────────────────────

type NotifKind = "match" | "event" | "event_live" | "course" | "capital" | "request" | "signal";

type ApiNotif = {
  id: number;
  title: string;
  body: string;
  kind: NotifKind;
  href: string;
  isRead: boolean;
  createdAt: string;
};

const NOTIF_ICONS: Record<NotifKind, React.ComponentType<{ className?: string }>> = {
  match: Sparkles,
  event: CalendarDays,
  event_live: CalendarDays,
  course: BookOpen,
  capital: TrendingUp,
  request: UserPlus,
  signal: Zap,
};

function notifHref(n: ApiNotif): string {
  if (n.href?.startsWith("/panel")) return n.href;
  const map: Record<NotifKind, string> = {
    match: "/panel/match",
    event: "/panel/events",
    event_live: "/panel/events",
    course: "/panel/courses",
    capital: "/panel/capital",
    request: "/panel/applications",
    signal: "/panel/signal",
  };
  return map[n.kind] ?? "/panel";
}

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
  const [, setLocation] = useLocation();
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

  const openNotif = async (n: ApiNotif) => {
    if (!n.isRead) {
      try {
        const res = await fetch(apiUrl(`/api/notifications/${n.id}/read`), {
          method: "PATCH",
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && typeof json.unreadCount === "number" && json.unreadCount === 0) onClear();
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch {
        /* ignore */
      }
    }
    onClose();
    setLocation(notifHref(n));
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const panel = (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-[var(--ink)]/45 dark:bg-black/55"
        aria-label={t("shell.closeMenu")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("shell.notifications")}
        className="panel-glass-strong fixed inset-x-0 bottom-0 z-[110] flex max-h-[min(88dvh,640px)] flex-col overflow-hidden border border-[var(--ink)]/10 shadow-2xl dark:border-white/10 sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-[64px] sm:w-[min(100vw-1.5rem,24rem)] sm:max-h-[min(70vh,520px)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--ink)]/[0.08] px-4 py-3 dark:border-white/10">
          <div className="min-w-0">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("shell.notifications")}
            </p>
            {count > 0 ? (
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                {t("shell.unreadCount", { n: count })}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {count > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void markAll()}
                className="min-h-10 px-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
              >
                {t("shell.markAllRead")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-11 items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] sm:size-9"
              aria-label={t("shell.closeMenu")}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {isLoading && notifs.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">{t("shell.notifLoading")}</p>
          )}
          {isError && (
            <button
              type="button"
              onClick={() => refetch()}
              className="w-full px-4 py-8 text-center text-sm text-[var(--error-ink)]"
            >
              {t("shell.notifError")}
            </button>
          )}
          {!isLoading && !isError && notifs.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">{t("shell.noNotifications")}</p>
          )}
          {notifs.map((n) => {
            const Icon = NOTIF_ICONS[n.kind] ?? Zap;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => void openNotif(n)}
                className={cn(
                  "flex w-full gap-3 border-b border-[var(--ink)]/[0.06] px-4 py-4 text-left transition-colors last:border-0 active:bg-[var(--ink)]/[0.04]",
                  !n.isRead && "bg-[var(--ink)]/[0.03]",
                )}
              >
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center bg-[var(--ink)]/[0.06]">
                  <Icon className="size-4 text-[var(--ink-body)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug text-[var(--ink)] break-words">
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--inner-green)]" />
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-body)] break-words whitespace-pre-wrap">
                    {n.body}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="font-mono text-label text-[var(--ink-subtle)]">
                      {relativeTime(n.createdAt, t, locale)}
                    </p>
                    <span className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                      {t("shell.openNotif")}
                      <ArrowUpRight className="size-3" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
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
          {user.role === "admin" ? (
            // "Admin" İngilizce ödünç kelime; html[lang="tr"] mirası CSS
            // uppercase'i "i" harfini "İ" yapıyordu (S-03). lang="en" ile
            // dotless-I korunuyor — bkz. ProductLabel'daki aynı desen.
            <span lang="en">{t("common.admin")}</span>
          ) : (
            t("common.member")
          )}
        </p>
      </div>
      {user.profileCompletionPct === 0 ? (
        // %0'da boş bir çubuk + "%0" yazısı hiçbir bilgi/aksiyon taşımıyordu
        // (S-04) — yerine doğrudan aksiyon veren tek satır.
        <Link
          href="/panel/profile"
          className="flex items-center gap-1 font-mono text-label font-semibold uppercase tracking-widest text-[var(--inner-green)] hover:underline"
        >
          {t("shell.createProfile")}
          <ArrowUpRight className="size-3" />
        </Link>
      ) : (
        user.profileCompletionPct < 100 && (
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
        )
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
      {/* Header — daralt/genişlet butonu artık sidebar sınırları içinde,
          logonun sağında (S-05: eskiden -right-3 ile sınırın yarısı dışarı
          taşıyordu) */}
      <div
        className={cn(
          "flex h-[60px] items-center border-b border-[var(--ink)]/[0.08] px-4 dark:border-white/10",
          collapsed ? "justify-center px-0" : "justify-between",
        )}
      >
        {!collapsed && (
          <Link href="/panel">
            <BrandMark collapsed={false} />
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Sidebar'ı genişlet" : "Sidebar'ı daralt"}
          className="hit-40 flex size-6 shrink-0 items-center justify-center text-[var(--ink-body)] transition-colors hover:text-[var(--ink)] dark:text-white/55 dark:hover:text-white"
        >
          {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </button>
      </div>

      {/* Nav — kaydırılabilir (Ana + Platform), üst/alt kenarda fade ile
          daha fazla içerik olduğu ipucu veriyor (S-01) */}
      <div
        className="min-h-0 flex-1 overflow-y-auto p-2"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%)",
        }}
      >
        <PanelNav role={user.role} collapsed={collapsed} variant="scroll" />
      </div>

      {/* Hesap — scroll alanının dışında sabit, her zaman erişilebilir (S-01) */}
      <div
        className={cn(
          "shrink-0 border-t border-[var(--ink)]/[0.08] p-2 dark:border-white/10",
          collapsed && "px-0",
        )}
      >
        <PanelNav role={user.role} collapsed={collapsed} variant="pinned" />
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
  const t = useT();
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

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

  // Odak yönetimi: açılınca drawer'a odaklan (kapatma butonu), kapanınca
  // tetikleyen elemana (hamburger butonu) geri dön (S-08).
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      closeButtonRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Odak tuzağı: Tab, drawer içindeki odaklanabilir öğeler arasında döner,
  // arka plandaki sayfaya kaçmaz (S-08).
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !asideRef.current) return;
      const focusable = asideRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[var(--ink-fixed)]/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            ref={asideRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.mobileMenuLabel")}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="panel-glass-strong fixed inset-y-0 left-0 z-[75] flex w-[min(280px,85vw)] flex-col border-r border-[var(--ink)]/[0.08] lg:hidden"
          >
            <div className="flex h-[60px] items-center justify-between border-b border-[var(--ink)]/[0.08] px-4">
              <BrandMark collapsed={false} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={t("shell.closeMenu")}
                className="text-[var(--ink-body)] hover:text-[var(--ink)]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto p-2"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%)",
              }}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a[href]")) onClose();
              }}
            >
              <PanelNav role={user.role} collapsed={false} variant="scroll" />
            </div>
            <div className="shrink-0 border-t border-[var(--ink)]/[0.08] p-2" onClick={onClose}>
              <PanelNav role={user.role} collapsed={false} variant="pinned" />
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocusSignal, setSearchFocusSignal] = useState(0);
  const [location] = useLocation();

  const openSearch = () => {
    setSearchOpen(true);
    setSearchFocusSignal((n) => n + 1);
  };
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
        {/* Top bar — mobilde sabit 44px hedefler, hit-40 yok (çakışma yapıyordu) */}
        <header className="relative z-40 flex h-14 shrink-0 items-center gap-1 border-b border-[var(--ink)]/[0.08] panel-glass-strong px-2 sm:h-[60px] sm:gap-2 sm:px-5 lg:px-6 dark:border-white/10">
          <HeaderIconButton
            label={t("shell.openMenu")}
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-[var(--ink-body)] hover:text-[var(--ink)]"
            data-onboarding="nav"
          >
            <Menu className="size-5" />
          </HeaderIconButton>

          <div className="min-w-0 shrink lg:hidden">
            <BrandMark collapsed={false} />
          </div>

          <div className="mx-auto hidden min-w-0 flex-1 justify-center px-4 lg:flex">
            <SearchTriggerBar onClick={openSearch} />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <HeaderIconButton label={t("search.open")} onClick={openSearch} className="lg:hidden">
              <Search className="size-4" />
            </HeaderIconButton>
            <div className="relative">
              <HeaderIconButton
                label={t("shell.notifications")}
                onClick={() => setNotifOpen((o) => !o)}
                data-onboarding="notifications"
              >
                <span className="relative inline-flex">
                  <Bell className="size-4" />
                  {notifCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center bg-[var(--inner-green)] font-mono text-[9px] text-black">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </span>
              </HeaderIconButton>
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
            </div>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="ml-0.5 size-9 object-cover sm:size-8"
              />
            ) : (
              <div
                className="ml-0.5 flex size-9 items-center justify-center border border-[var(--ink)]/15 bg-[var(--ink)] font-mono text-label uppercase text-[var(--bone)] sm:size-8 dark:border-white/10 dark:bg-white/10 dark:text-[#F4F1EC]"
                aria-hidden
              >
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

      <LegalAcceptModal />
      <PanelOnboarding userName={user.name} />
      <PanelSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        focusSignal={searchFocusSignal}
      />
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
