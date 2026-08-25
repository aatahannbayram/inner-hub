"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import {
  UserCircle,
  CreditCard,
  HelpCircle,
  LogOut,
  ArrowUpRight,
  ChevronDown,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type AccountUser = {
  name: string;
  email: string;
  role: "member" | "admin";
  avatarUrl?: string;
  profileCompletionPct?: number;
};

type AccountMenuProps = {
  user: AccountUser;
  onLogout?: () => void;
};

type AccountLink = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const LINKS: AccountLink[] = [
  { href: "/panel/profile", labelKey: "nav.profile", icon: UserCircle },
  { href: "/panel/membership", labelKey: "nav.membership", icon: CreditCard },
  { href: "/panel/faq", labelKey: "nav.faq", icon: HelpCircle },
];

const PREFETCH: Record<string, () => Promise<unknown>> = {
  "/panel/profile": () => import("@/pages/panel/Profile"),
  "/panel/membership": () => import("@/pages/panel/Membership"),
  "/panel/faq": () => import("@/pages/panel/FAQ"),
  "/panel/settings": () => import("@/pages/panel/Settings"),
};

function isActive(href: string, location: string): boolean {
  if (location === href) return true;
  return location.startsWith(`${href}/`);
}

function AvatarFace({
  user,
  className,
}: {
  user: AccountUser;
  className?: string;
}) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={cn("size-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex size-full items-center justify-center font-mono text-[11px] uppercase tracking-wide",
        className,
      )}
      aria-hidden
    >
      {user.name.slice(0, 2)}
    </span>
  );
}

export function AccountMenu({ user, onLogout }: AccountMenuProps) {
  const t = useT();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const pct = user.profileCompletionPct ?? 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const go = (href: string) => {
    setOpen(false);
    setLocation(href);
  };

  const panel = open
    ? createPortal(
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-[var(--ink)]/40 dark:bg-black/55"
            aria-label={t("shell.closeMenu")}
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "panel-glass-strong fixed z-[110] flex flex-col overflow-hidden border border-[var(--ink)]/10 shadow-2xl dark:border-white/10",
              // Mobil: alt sheet (parmakla kolay)
              "inset-x-0 bottom-0 max-h-[min(88dvh,560px)] rounded-t-2xl",
              // Masaüstü: sağ üst avatar altına popover
              "sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-[64px] sm:w-[min(100%-1.5rem,20.5rem)] sm:max-h-[min(70vh,520px)] sm:rounded-xl",
            )}
          >
            {/* Mobil tutamak */}
            <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-[var(--ink)]/20 dark:bg-white/20" />
            </div>

            {/* Kimlik */}
            <div className="flex items-center gap-3 border-b border-[var(--ink)]/[0.08] px-4 py-4 dark:border-white/10">
              <div
                className={cn(
                  "flex size-12 shrink-0 overflow-hidden border border-[var(--ink)]/15 bg-[var(--ink)] text-[var(--bone)] dark:border-white/15 dark:bg-white/10 dark:text-[#F4F1EC]",
                  "sm:size-11",
                )}
              >
                <AvatarFace user={user} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  id={titleId}
                  className="truncate text-[15px] font-semibold tracking-tight text-[var(--ink)] dark:text-[#F4F1EC]"
                >
                  {user.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)] dark:text-white/45">
                  {user.email}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-body)] dark:text-white/40">
                  {user.role === "admin" ? (
                    <span lang="en">{t("common.admin")}</span>
                  ) : (
                    t("common.member")
                  )}
                </p>
              </div>
            </div>

            {/* Profil tamamlanma */}
            {pct < 100 ? (
              <div className="border-b border-[var(--ink)]/[0.08] px-4 py-3 dark:border-white/10">
                {pct === 0 ? (
                  <button
                    type="button"
                    onClick={() => go("/panel/profile")}
                    className="flex w-full items-center justify-between gap-2 rounded-lg bg-[var(--inner-green)]/[0.1] px-3 py-2.5 text-left transition-colors hover:bg-[var(--inner-green)]/[0.16]"
                  >
                    <span className="text-sm font-medium text-[var(--inner-green)]">
                      {t("shell.createProfile")}
                    </span>
                    <ArrowUpRight className="size-4 text-[var(--inner-green)]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go("/panel/profile")}
                    className="w-full space-y-2 text-left"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-strong)] dark:text-white/55">
                        {t("shell.profileCompletion")}
                      </span>
                      <span className="font-mono text-[10px] font-semibold tabular-nums text-[var(--ink-strong)] dark:text-white/55">
                        %{pct}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden bg-[var(--ink)]/10 dark:bg-white/10">
                      <div
                        className="h-full bg-[var(--inner-green)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                )}
              </div>
            ) : null}

            {/* Hesap linkleri */}
            <nav
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
              aria-label={t("nav.sectionAccount")}
            >
              <ul className="flex flex-col gap-0.5">
                {LINKS.map((item) => {
                  const active = isActive(item.href, location);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => {
                          void PREFETCH[item.href]?.();
                        }}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors sm:min-h-11 sm:rounded-lg sm:text-sm",
                          active
                            ? "bg-[var(--ink)] text-[var(--bone)] dark:bg-[var(--inner-green)]/[0.14] dark:text-[#F4F1EC]"
                            : "text-[var(--ink)] hover:bg-[var(--ink)]/[0.05] dark:text-[#F4F1EC] dark:hover:bg-white/[0.06]",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-[18px] shrink-0",
                            active ? "opacity-100" : "opacity-55",
                          )}
                          strokeWidth={1.6}
                        />
                        <span className={cn("flex-1 font-medium", active && "font-semibold")}>
                          {t(item.labelKey)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {user.role === "admin" ? (
                  <li>
                    <Link
                      href="/panel/settings"
                      onClick={() => setOpen(false)}
                      aria-current={isActive("/panel/settings", location) ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors sm:min-h-11 sm:rounded-lg sm:text-sm",
                        isActive("/panel/settings", location)
                          ? "bg-[var(--ink)] text-[var(--bone)] dark:bg-[var(--inner-green)]/[0.14] dark:text-[#F4F1EC]"
                          : "text-[var(--ink)] hover:bg-[var(--ink)]/[0.05] dark:text-[#F4F1EC] dark:hover:bg-white/[0.06]",
                      )}
                    >
                      <Settings
                        className={cn(
                          "size-[18px] shrink-0",
                          isActive("/panel/settings", location) ? "opacity-100" : "opacity-55",
                        )}
                        strokeWidth={1.6}
                      />
                      <span className="flex-1 font-medium">{t("nav.settings")}</span>
                    </Link>
                  </li>
                ) : null}
              </ul>

              <div className="mt-2 border-t border-[var(--ink)]/[0.08] pt-2 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onLogout?.();
                  }}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-[var(--ink-body)] transition-colors hover:bg-[var(--ink)]/[0.05] hover:text-[var(--ink)] sm:min-h-11 sm:rounded-lg sm:text-sm dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <LogOut className="size-[18px] shrink-0 opacity-70" strokeWidth={1.6} />
                  <span className="font-medium">{t("common.logoutLong")}</span>
                </button>
              </div>
            </nav>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("shell.openAccount")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group ml-0.5 inline-flex items-center gap-1 rounded-full p-0.5 transition-colors",
          "hover:bg-[var(--ink)]/[0.06] dark:hover:bg-white/[0.08]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--inner-green)]",
          open && "bg-[var(--ink)]/[0.08] dark:bg-white/[0.1]",
        )}
      >
        <span
          className={cn(
            "flex size-9 overflow-hidden border border-[var(--ink)]/15 bg-[var(--ink)] text-[var(--bone)] sm:size-8",
            "dark:border-white/15 dark:bg-white/10 dark:text-[#F4F1EC]",
            "transition-transform active:scale-[0.96]",
          )}
        >
          <AvatarFace user={user} />
        </span>
        <ChevronDown
          className={cn(
            "hidden size-3.5 text-[var(--ink-muted)] transition-transform sm:block",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {typeof document !== "undefined" ? panel : null}
    </div>
  );
}
