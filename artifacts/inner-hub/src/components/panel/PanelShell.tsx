"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Link } from "wouter";
import { LogOut, Menu, X, Bell, ChevronLeft, ChevronRight, Sparkles, CalendarDays, TrendingUp, UserPlus, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PanelNav } from "./PanelNav";
import { PanelPageTransition } from "./PanelPageTransition";

// ─── Notifications ────────────────────────────────────────────────────────────

type Notif = {
  id: number;
  type: "match" | "event" | "capital" | "request" | "signal";
  title: string;
  sub: string;
  time: string;
  read: boolean;
};

const NOTIF_ICONS: Record<Notif["type"], React.ComponentType<{ className?: string }>> = {
  match:   Sparkles,
  event:   CalendarDays,
  capital: TrendingUp,
  request: UserPlus,
  signal:  Zap,
};

const INITIAL_NOTIFS: Notif[] = [
  { id: 1, type: "match",   title: "Yeni eşleşme", sub: "Selin Kaya ile %87 uyum saptandı",       time: "2 saat önce",  read: false },
  { id: 2, type: "event",   title: "Etkinlik yarın", sub: "AI & HR Zirvesi — Yarın 10:00",          time: "5 saat önce",  read: false },
  { id: 3, type: "signal",  title: "inner·signal güncellemesi", sub: "Bu haftanın 3 yeni teması hazır", time: "8 saat önce",  read: false },
  { id: 4, type: "capital", title: "Yeni SPV açıldı", sub: "DeepTech Fund — ₺500K hedef",          time: "1 gün önce",   read: false },
  { id: 5, type: "request", title: "Tanışma isteği", sub: "Mert Öztürk bağlantı isteği gönderdi",  time: "2 gün önce",   read: true  },
  { id: 6, type: "match",   title: "Eşleşme onaylandı", sub: "Defne Arslan tanışmayı kabul etti",  time: "3 gün önce",   read: true  },
];

function NotifPanel({
  onClose,
  count,
  onClear,
}: {
  onClose: () => void;
  count: number;
  onClear: () => void;
}) {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);

  const markAll = () => {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    onClear();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-4 top-[68px] z-50 w-80 border border-[var(--ink)]/10 bg-[var(--bone)] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ink)]/[0.08] px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40">Bildirimler</p>
            {count > 0 && (
              <span className="flex size-4 items-center justify-center bg-[var(--ink)] font-mono text-[8px] text-[var(--bone)]">
                {count}
              </span>
            )}
          </div>
          {count > 0 && (
            <button
              onClick={markAll}
              className="font-mono text-[8px] uppercase tracking-widest text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors"
            >
              Tümünü oku
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifs.map((n) => {
            const Icon = NOTIF_ICONS[n.type];
            return (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 border-b border-[var(--ink)]/[0.05] px-4 py-3 last:border-0 transition-colors",
                  !n.read && "bg-[var(--ink)]/[0.025]",
                )}
              >
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center bg-[var(--ink)]/[0.06]">
                  <Icon className="size-3.5 text-[var(--ink)]/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-[var(--ink)] font-light leading-snug">{n.title}</p>
                    {!n.read && (
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--inner-green)]" />
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] leading-snug text-[var(--ink)]/35">{n.sub}</p>
                  <p className="mt-1 font-mono text-[8px] text-[var(--ink)]/20">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--ink)]/[0.08] px-4 py-2.5">
          <p className="font-mono text-[8px] text-[var(--ink)]/20 text-center">inner·hub · bildirimler</p>
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
function LogoSquare({ size, translate }: { size: string; translate: string }) {
  return (
    <span className={`relative inline-block ${size} ${translate} shrink-0`}>
      <span className={`absolute inset-0 bg-[var(--inner-green)] animate-logo-ping`} />
      <span className="relative block size-full bg-[var(--inner-green)]" />
    </span>
  );
}

function BrandMark({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex size-8 items-center justify-center">
        <span
          className="font-serif text-lg leading-none text-[var(--ink)]"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
        >
          i<LogoSquare size="size-[0.38em]" translate="translate-y-[0.08em]" />
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-0 leading-none">
      <span
        className="font-serif text-xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100, letterSpacing: "-0.015em" }}
      >
        innerhub
      </span>
      <LogoSquare size="size-[0.42em]" translate="translate-y-[0.06em]" />
    </div>
  );
}

// ─── Sidebar footer ───────────────────────────────────────────────────────────
function SidebarFooter({
  user,
  collapsed,
  onLogout,
}: {
  user: PanelUser;
  collapsed: boolean;
  onLogout?: () => void;
}) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full justify-center p-2 text-[var(--ink)]/40 transition-colors hover:text-[var(--ink)]"
        title="Çıkış yap"
      >
        <LogOut className="size-4" />
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <p className="truncate text-sm font-medium text-[var(--ink)]">{user.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
          {user.role === "admin" ? "Admin" : "Üye"}
        </p>
      </div>
      {user.profileCompletionPct < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40">
              Profil tamamlanma
            </span>
            <span className="font-mono text-[9px] tabular-nums text-[var(--ink)]/40">
              %{user.profileCompletionPct}
            </span>
          </div>
          <div className="h-px w-full bg-[var(--ink)]/10">
            <div
              className="h-full bg-[var(--inner-green)] transition-all duration-700"
              style={{ width: `${user.profileCompletionPct}%` }}
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-1.5 text-[var(--ink)]/40 transition-colors hover:text-[var(--ink)]"
      >
        <LogOut className="size-3.5" />
        <span className="font-mono text-[10px] uppercase tracking-widest">Çıkış Yap</span>
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
      className={cn(
        "relative hidden h-full shrink-0 flex-col border-r border-[var(--ink)]/[0.08] bg-[var(--bone)] transition-all duration-300 ease-expo lg:flex",
        collapsed ? "w-[60px]" : "w-[220px]",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-[60px] items-center border-b border-[var(--ink)]/[0.08] px-4",
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
          "border-t border-[var(--ink)]/[0.08] p-4",
          collapsed && "flex justify-center p-2",
        )}
      >
        <SidebarFooter user={{ ...user, profileCompletionPct: user.profileCompletionPct ?? 0 }} collapsed={collapsed} onLogout={onLogout} />
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className="absolute -right-3 top-[72px] z-10 flex size-6 items-center justify-center border border-[var(--ink)]/[0.08] bg-[var(--bone)] text-[var(--ink)]/40 transition-colors hover:text-[var(--ink)]"
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
            className="fixed inset-0 z-[80] bg-[var(--ink)]/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 left-0 z-[90] flex w-[min(280px,85vw)] flex-col border-r border-[var(--ink)]/[0.08] bg-[var(--bone)] lg:hidden"
          >
            <div className="flex h-[60px] items-center justify-between border-b border-[var(--ink)]/[0.08] px-4">
              <BrandMark collapsed={false} />
              <button type="button" onClick={onClose} className="text-[var(--ink)]/40 hover:text-[var(--ink)]">
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
function ShellInner({ user, children, onLogout }: PanelShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(user.notificationCount ?? 0);

  return (
    <div className="flex h-svh overflow-hidden bg-[var(--bone)] text-[var(--ink)]">
      <DesktopSidebar user={user} onLogout={onLogout} />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="z-40 flex h-[60px] shrink-0 items-center justify-between border-b border-[var(--ink)]/[0.08] bg-[var(--bone)]/90 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="text-[var(--ink)]/40 hover:text-[var(--ink)] lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <BrandMark collapsed={false} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Online indicator */}
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--inner-green)] animate-beacon" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 hidden sm:block">
                online
              </span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative text-[var(--ink)]/50 hover:text-[var(--ink)] transition-colors"
              aria-label="Bildirimler"
            >
              <Bell className="size-4" />
              {notifCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center bg-[var(--ink)] font-mono text-[8px] text-[var(--bone)]">
                  {notifCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <NotifPanel
                onClose={() => setNotifOpen(false)}
                count={notifCount}
                onClear={() => setNotifCount(0)}
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
              <div className="flex size-7 items-center justify-center bg-[var(--ink)] font-mono text-[10px] uppercase text-[var(--bone)]">
                {user.name.slice(0, 2)}
              </div>
            )}
          </div>
        </header>

        {/* Main content — tek scroll container */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <PanelPageTransition>{children}</PanelPageTransition>
        </main>
      </div>
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
