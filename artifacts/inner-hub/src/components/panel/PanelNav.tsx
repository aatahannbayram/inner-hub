"use client";

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
};

const PREFETCH: Record<string, () => Promise<unknown>> = {
  "/panel": () => import("@/pages/panel/Dashboard"),
  "/panel/chat": () => import("@/pages/panel/Chat"),
  "/panel/courses": () => import("@/pages/panel/Courses"),
  "/panel/events": () => import("@/pages/panel/Events"),
  "/panel/members": () => import("@/pages/panel/Members"),
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
      { href: "/panel/perks", labelKey: "nav.perks", icon: Gift },
    ],
  },
  {
    id: "platform",
    titleKey: "nav.sectionPlatform",
    items: [
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
      <span className={cn("shrink-0", active ? "text-[var(--bone)]/50" : "text-[var(--ink-muted)]")}>
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
        "group flex min-h-10 items-center gap-2.5 rounded-none px-2.5 py-2.5 text-sm transition-colors duration-150",
        isActive
          ? "bg-[var(--ink)] text-[var(--bone)]"
          : "text-[var(--ink-body)] hover:bg-[var(--ink)]/[0.05] hover:text-[var(--ink)]",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? (item.mark ? `inner.${item.mark}` : label) : undefined}
    >
      <item.icon
        className={cn(
          "size-[15px] shrink-0",
          isActive ? "opacity-100" : "opacity-55 group-hover:opacity-100",
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
  return (
    <div className="mb-4 last:mb-0">
      {!collapsed ? (
        <p className="mb-1.5 px-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          {t(section.titleKey)}
        </p>
      ) : (
        <div className="mx-auto mb-1.5 h-px w-4 bg-[var(--ink)]/15" aria-hidden />
      )}
      <div className="flex flex-col gap-px">
        {section.items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>
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
