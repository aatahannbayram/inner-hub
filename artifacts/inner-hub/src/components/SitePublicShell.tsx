import type { ReactNode } from "react";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { SiteFooter } from "@/components/SiteFooter";

/** Haberler / public içerik sayfaları - ana menü + footer */
export function SitePublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-atmosphere flex min-h-screen flex-col bg-[var(--ink-fixed)] text-[var(--bone-fixed)]">
      <FloatingNavbar placement="static" />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
