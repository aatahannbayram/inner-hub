/** Gerçek üye avatarları API `avatarUrl` alanından gelir; stok persona haritası yok. */
export const MEMBER_PHOTOS: Record<string, string> = {};

export function memberPhoto(name: string): string | undefined {
  return MEMBER_PHOTOS[name];
}
