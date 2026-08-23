import { useState } from "react";
import { avatarColor } from "@/lib/avatarColor";
import { toUpperTR } from "@/lib/tr";
import { cn } from "@/lib/utils";

const SIZE_PX = { sm: 32, md: 40, lg: 56 } as const;

export type MemberAvatarSize = keyof typeof SIZE_PX;

function dicebearUrl(seed: string, style?: string | null) {
  const st = (style || "lorelei").trim() || "lorelei";
  const s = (seed || "inner").trim() || "inner";
  return `https://api.dicebear.com/9.x/${st}/svg?seed=${encodeURIComponent(s)}&backgroundType=gradientLinear`;
}

function initialsFrom(seed: string, alt?: string): string {
  const source = (alt || seed || "?").trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return toUpperTR((parts[0][0] ?? "") + (parts[1][0] ?? ""));
  }
  return toUpperTR(source.slice(0, 2));
}

export function MemberAvatar({
  seed,
  avatarUrl,
  avatarStyle,
  orgLogoUrl,
  orgName,
  size = "md",
  className,
  alt,
}: {
  seed: string;
  avatarUrl?: string | null;
  avatarStyle?: string | null;
  orgLogoUrl?: string | null;
  orgName?: string | null;
  size?: MemberAvatarSize;
  className?: string;
  alt?: string;
}) {
  const px = SIZE_PX[size];
  const src = avatarUrl?.trim() || dicebearUrl(seed, avatarStyle);
  const badge = Math.max(12, Math.round(px * 0.36));
  const [failed, setFailed] = useState(false);
  const initials = initialsFrom(seed, alt);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: px, height: px }}
    >
      {failed ? (
        <div
          className="flex size-full items-center justify-center font-mono text-[var(--bone)]"
          style={{
            backgroundColor: avatarColor(seed || alt || "inner"),
            fontSize: Math.max(10, Math.round(px * 0.32)),
          }}
          aria-label={alt || seed}
        >
          {initials}
        </div>
      ) : (
        <img
          src={src}
          alt={alt ?? ""}
          width={px}
          height={px}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {orgLogoUrl ? (
        <img
          src={orgLogoUrl}
          alt={orgName ?? ""}
          width={badge}
          height={badge}
          className="absolute -bottom-0.5 -right-0.5 rounded-sm border border-[var(--bone)] bg-[var(--bone)] object-cover shadow-sm"
          style={{ width: badge, height: badge }}
        />
      ) : null}
    </div>
  );
}
