import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type PanelGlassProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article" | "section";
  /** denser blur / more opaque */
  strong?: boolean;
};

/**
 * Invite success kartı dilinde cam yüzey.
 * Dark’ta soft gray glass; light’ta hafif bone translucency.
 */
export function PanelGlass({
  as: Tag = "div",
  strong = false,
  className,
  children,
  ...rest
}: PanelGlassProps) {
  return (
    <Tag
      className={cn(strong ? "panel-glass-strong" : "panel-glass", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
