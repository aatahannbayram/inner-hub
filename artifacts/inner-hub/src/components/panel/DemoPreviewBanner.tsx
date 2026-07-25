/** Mock / henüz API’siz paneller için dürüst etiket (UX trust). */
export function DemoPreviewBanner({
  surface = "Bu yüzey",
}: {
  surface?: string;
}) {
  return (
    <div
      role="status"
      className="border border-[var(--ink)]/[0.12] bg-[var(--ink)]/[0.03] px-4 py-2.5"
    >
      <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
        Önizleme · demo veri
      </p>
      <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
        {surface} henüz canlı backend’e bağlı değil. Etkileşimler kalıcı kaydedilmez.
      </p>
    </div>
  );
}
