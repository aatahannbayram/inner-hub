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
import { Lockup } from "@/components/Lockup";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("member" | "admin")[];
  badge?: number;
  /** inner■{mark} ürün etiketi (· yerine yeşil kare) */
  mark?: string;
};

/** Hover/focus prefetch — F12 lazy chunk'larını tıklamadan önce ısıtır */
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

const navItems: NavItem[] = [
  { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/panel/chat", label: "Topluluk Chat", icon: MessageSquare },
  { href: "/panel/courses", label: "Kurslarım", icon: BookOpen },
  { href: "/panel/events", label: "Etkinlikler", icon: CalendarDays },
  { href: "/panel/members", label: "Katılımcılar", icon: Users },
  { href: "/panel/perks", label: "Ayrıcalıklar", icon: Gift },
  { href: "/panel/signal", label: "inner signal", mark: "signal", icon: Zap },
  { href: "/panel/match", label: "inner match", mark: "match", icon: Sparkles },
  { href: "/panel/capital", label: "inner capital", mark: "capital", icon: TrendingUp },
  { href: "/panel/vault", label: "inner vault", mark: "vault", icon: BookMarked },
  { href: "/panel/pulse", label: "inner pulse", mark: "pulse", icon: Activity },
  { href: "/panel/id", label: "inner id", mark: "id", icon: Fingerprint },
  { href: "/panel/api", label: "inner api", mark: "api", icon: Webhook },
  { href: "/panel/profile", label: "Profilim", icon: UserCircle },
  { href: "/panel/faq", label: "SSS", icon: HelpCircle },
  { href: "/panel/membership", label: "Üyelik", icon: CreditCard },
];

const adminItems: NavItem[] = [
  { href: "/panel/applications", label: "Başvurular", icon: ClipboardList },
  { href: "/panel/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/panel/settings", label: "Ayarlar", icon: Settings },
];

type PanelNavProps = {
  role?: "member" | "admin";
  collapsed?: boolean;
};

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const [location] = useLocation();
  const isActive =
    item.href === "/panel"
      ? location === "/panel"
      : location.startsWith(item.href);

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
        "group flex items-center gap-3 rounded-none px-3 py-2.5 text-sm transition-colors duration-150",
        isActive
          ? "bg-[var(--ink)] text-[var(--bone)]"
          : "text-[var(--ink-body)] hover:bg-[var(--ink)]/[0.06] hover:text-[var(--ink)]",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon
        className={cn(
          "size-4 shrink-0",
          isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100",
        )}
      />
      {!collapsed && (
        item.mark ? (
          <Lockup
            suffix={item.mark}
            className={cn(
              "min-w-0 truncate text-[0.95em] leading-none",
              isActive ? "text-[var(--bone)]" : "text-inherit",
            )}
          />
        ) : (
          <span className="truncate font-light tracking-wide">{item.label}</span>
        )
      )}
      {!collapsed && item.badge ? (
        <span className="ml-auto font-mono text-label tabular-nums">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function PanelNav({ role = "member", collapsed = false }: PanelNavProps) {
  return (
    <nav className="flex flex-col gap-0.5">
      {navItems.map((item) => (
        <NavLink key={item.href} item={item} collapsed={collapsed} />
      ))}

      {role === "admin" && (
        <>
          <div
            className={cn(
              "my-3 border-t border-[var(--ink)]/10",
              collapsed && "mx-2",
            )}
          />
          {adminItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </>
      )}
    </nav>
  );
}
