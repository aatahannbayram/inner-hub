import { memberPhoto } from "@/lib/memberPhotos";
import { avatarColor } from "@/lib/avatarColor";
import { cn } from "@/lib/utils";

/**
 * Renders a real generated photo for known community members, falling back
 * to the colored-initials treatment for anyone without one (e.g. "Yeni
 * kurucu" placeholders). Keeps the same person looking the same everywhere
 * their name appears — Members, Match, Signal, Capital, Chat, Pulse.
 */
export function PersonAvatar({
  name,
  initials,
  className,
}: {
  name: string;
  initials: string;
  /** Sizing + text-size classes, e.g. "size-10 text-caption" — shared by both the photo and fallback */
  className?: string;
}) {
  const photo = memberPhoto(name);
  if (photo) {
    return <img src={photo} alt={name} className={cn("shrink-0 object-cover", className)} />;
  }
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center font-mono uppercase text-[var(--bone)]", className)}
      style={{ backgroundColor: avatarColor(name) }}
    >
      {initials}
    </div>
  );
}
