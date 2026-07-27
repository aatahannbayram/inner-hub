"use client";

import { Toaster as Sonner } from "sonner";
import { useThemeOptional } from "@/hooks/useTheme";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** next-themes ile çakışmasın - kendi ThemeProvider'ımızı kullanır */
const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeOptional();
  const sonnerTheme: ToasterProps["theme"] = theme
    ? theme.mode === "system"
      ? "system"
      : theme.isDark
        ? "dark"
        : "light"
    : "system";

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
