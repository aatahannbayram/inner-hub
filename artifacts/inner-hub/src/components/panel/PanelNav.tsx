"use client";

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  CalendarDays,
  Users,
  Gift,
  HelpCircle,
  BarChart3,
  ClipboardList,
  Settings,
  CreditCard,
  Zap,
  Sparkles,
  TrendingUp,
  BookMarked,
  Activity,
  Fingerprint,
  Webhook,
  UserCircle,
  Newspaper,
  Mic2,
  Building2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  mark?: string;
  badge?: number;
};

type NavSection = {
  id: string;
  titleKey: string;
  items: NavItem[];
  collapsible?: boolean;
};

const PREFETCH: Record<string, () => Promise<unknown>> = {
  "/panel": () => import("@/pages/panel/Dashboard"),
  "/panel/chat": () => import("@/pages/panel/Chat"),
  "/panel/courses": () => import("@/pages/panel/Courses"),
  "/panel/events": () => import("@/pages/panel/Events"),
  "/panel/stage": () => import("@/pages/panel/Stage"),
  "/panel/members": () => import("@/pages/panel/Members"),
  "/panel/org": () => import("@/pages/panel/Org"),
  "/panel/perks": () => import("@/pages/panel/Perks"),
  "/panel/signal": () => import("@/pages/panel/Signal"),
  "/panel/match": () => import("@/pages/panel/Match"),
  "/panel/capital": () => import("@/pages/panel/Capital"),
  "/panel/vault": () => import("@/pages/panel/Vault"),
  "/panel/pulse": () => import("@/pages/panel/Pulse"),
  "/panel/id": () => import("@/pages/panel/InnerId"),
  "/panel/api": () => import("@/pages/panel/InnerApi"),
  "/panel/profile": () => import("@/pages/panel/Profile"),
  "/panel/faq": () => import("@/pages/panel/FAQ"),
  "/panel/membership": () => import("@/pages/panel/Membership"),
  "/panel/applications": () => import("@/pages/panel/Applications"),
  "/panel/courses/admin": () => import("@/pages/panel/CoursesAdmin"),
  "/panel/events/admin": () => import("@/pages/panel/EventsAdmin"),
  "/panel/haberler": () => import("@/pages/panel/HaberlerAdmin"),
  "/panel/analytics": () => import("@/pages/panel/Analytics"),
  "/panel/settings": () => import("@/pages/panel/Settings"),
};

const SECTION_DEFS: NavSection[] = [
  {
    id: "main",
    titleKey: "nav.sectionMain",
    items: [
      { href: "/panel", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/panel/chat", labelKey: "nav.community", icon: MessageSquare },
      { href: "/panel/courses", labelKey: "nav.courses", icon: BookOpen },
      { href: "/panel/events", labelKey: "nav.events", icon: CalendarDays },
      { href: "/panel/members", labelKey: "nav.members", icon: Users },
      { href: "/panel/org", labelKey: "nav.org", icon: Building2 },
      { href: "/panel/perks", labelKey: "nav.perks", icon: Gift },
    ],
  },
  {
    id: "platform",
    titleKey: "nav.sectionPlatform",
    collapsible: true,
    items: [
      { href: "/panel/stage", labelKey: "nav.dashboard", mark: "stage", icon: Mic2 },
      { href: "/panel/signal", labelKey: "nav.dashboard", mark: "signal", icon: Zap },
      { href: "/panel/match", labelKey: "nav.dashboard", mark: "match", icon: Sparkles },
      { href: "/panel/capital", labelKey: "nav.dashboard", mark: "capital", icon: TrendingUp },
      { href: "/panel/vault", labelKey: "nav.dashboard", mark: "vault", icon: BookMarked },
      { href: "/panel/pulse", labelKey: "nav.dashboard", mark: "pulse", icon: Activity },
      { href: "/panel/id", labelKey: "nav.dashboard", mark: "id", icon: Fingerprint },
      { href: "/panel/api", labelKey: "nav.dashboard", mark: "api", icon: Webhook },
    ],
  },
  {
    id: "account",
    titleKey: "nav.sectionAccount",
    items: [
      { href: "/panel/profile", labelKey: "nav.profile", icon: UserCircle },
      { href: "/panel/membership", labelKey: "nav.membership", icon: CreditCard },
      { href: "/panel/faq", labelKey: "nav.faq", icon: HelpCircle },
    ],
  },
];

const ADMIN_SECTION: NavSection = {
  id: "admin",
  titleKey: "nav.sectionAdmin",
  items: [
    { href: "/panel/applications", labelKey: "nav.applications", icon: ClipboardList },
    { href: "/panel/courses/admin", labelKey: "nav.coursesAdmin", icon: BookOpen },
    { href: "/panel/events/admin", labelKey: "nav.eventsAdmin", icon: CalendarDays },
    { href: "/panel/haberler", labelKey: "nav.haberlerAdmin", icon: Newspaper },
    { href: "/panel/analytics", labelKey: "nav.analytics", icon: BarChart3 },
    { href: "/panel/settings", labelKey: "nav.settings", icon: Settings },
  ],
};

type PanelNavProps = {
  role?: "member" | "admin";
  collapsed?: boolean;
};

function ProductLabel({ mark, active }: { mark: string; active: boolean }) {
  return (
    <span
      lang="en"
      className="inline-flex min-w-0 items-baseline truncate text-[13px] font-medium tracking-tight leading-none"
    >
      <span
        className={cn(
          "shrink-0",
          active
            ? "text-[var(--ink)]/45 dark:text-white/45"
            : "text-[var(--ink-muted)] dark:text-white/35",
        )}
      >
        inner.
      </span>
      <span className="truncate">{mark}</span>
    </span>
  );
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const t = useT();
  const [location] = useLocation();
  const label = t(item.labelKey);
  const isActive =
    item.href === "/panel" ? location === "/panel" : location.startsWith(item.href);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={() => {
        void PREFETCH[item.href]?.();
      }}
      onFocus={() => {
        void PREFETCH[item.href]?.();
      }}
      className={cn(
        "group relative flex min-h-10 items-center gap-2.5 rounded-none px-2.5 py-2.5 text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
        isActive
          ? [
              "bg-[var(--ink)] text-[var(--bone)]",
              "dark:bg-[var(--inner-green)]/[0.12] dark:text-[#F4F1EC] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
            ]
          : [
              "text-[var(--ink-body)] hover:bg-[var(--ink)]/[0.05] hover:text-[var(--ink)]",
              "dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white",
            ],
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? (item.mark ? `inner.${item.mark}` : label) : undefined}
    >
      {isActive ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px] bg-[var(--inner-green)] dark:w-[3px]"
        />
      ) : null}
      <item.icon
        className={cn(
          "size-[15px] shrink-0",
          isActive ? "opacity-100" : "opacity-55 group-hover:opacity-100 dark:opacity-55 dark:group-hover:opacity-95",
        )}
        strokeWidth={1.6}
      />
      {!collapsed &&
        (item.mark ? (
          <ProductLabel mark={item.mark} active={isActive} />
        ) : (
          <span className="truncate text-[13px] font-medium tracking-tight">{label}</span>
        ))}
      {!collapsed && item.badge ? (
        <span className="ml-auto font-mono text-[10px] tabular-nums opacity-70">{item.badge}</span>
      ) : null}
    </Link>
  );
}

function Section({ section, collapsed }: { section: NavSection; collapsed: boolean }) {
  const t = useT();
  const [location] = useLocation();
  const hasActiveChild = section.items.some((item) =>
    item.href === "/panel" ? location === "/panel" : location.startsWith(item.href),
  );
  const [open, setOpen] = useState(hasActiveChild);

  const showItems = !section.collapsible || collapsed || open || hasActiveChild;

  return (
    <div className="mb-5 last:mb-0">
      {!collapsed ? (
        section.collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={showItems}
            className="mb-2 flex w-full items-center justify-between px-2.5 py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-muted)] dark:text-white/40">
              {t(section.titleKey)}
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 text-[var(--ink-muted)] transition-transform",
                showItems && "rotate-180",
              )}
            />
          </button>
        ) : (
          <p className="mb-2 px-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-muted)] dark:text-white/40">
            {t(section.titleKey)}
          </p>
        )
      ) : (
        <div className="mx-auto mb-2 h-px w-4 bg-[var(--ink)]/15 dark:bg-white/15" aria-hidden />
      )}
      {showItems && (
        <div className="flex flex-col gap-0.5">
          {section.items.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PanelNav({ role = "member", collapsed = false }: PanelNavProps) {
  const t = useT();
  const sections = role === "admin" ? [...SECTION_DEFS, ADMIN_SECTION] : SECTION_DEFS;

  return (
    <nav className="flex flex-col" aria-label={t("nav.sectionMain")}>
      {sections.map((section) => (
        <Section key={section.id} section={section} collapsed={collapsed} />
      ))}
    </nav>
  );
}
