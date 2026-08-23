import { useState } from "react";
import { memberPhoto } from "@/lib/memberPhotos";
import { avatarColor } from "@/lib/avatarColor";
import { cn } from "@/lib/utils";

/**
 * Gerçek foto (src) varsa onu gösterir; yoksa bilinen isimler için MEMBER_PHOTOS;
 * o da yoksa (veya yükleme hata verirse) renkli initials.
 */
export function PersonAvatar({
  name,
  initials,
  className,
  src,
}: {
  name: string;
  initials: string;
  /** Sizing + text-size classes, e.g. "size-10 text-caption" */
  className?: string;
  /** Profil / LinkedIn fotoğrafı — varsa AI mock yerine bunu kullan */
  src?: string | null;
}) {
  const photo = (src && src.trim()) || memberPhoto(name);
  const [failed, setFailed] = useState(false);

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={name}
        className={cn("shrink-0 object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
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
