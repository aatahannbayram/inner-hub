import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Hash, Volume2, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { PersonAvatar } from "@/components/panel/PersonAvatar";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState } from "@/components/panel/Skeletons";
import { useT } from "@/i18n";

const CHANNEL_SUGGESTIONS: Record<string, string[]> = {
  genel: ["Merhaba herkese 👋", "Bu hafta ne çalışıyorsunuz?", "Bir etkinlik önerim var"],
  duyurular: ["Tarihi takvime ekledim", "Detay paylaşır mısınız?"],
  girisimler: ["Tebrikler! 🚀", "Nasıl başardınız, detay verir misiniz?"],
  "ai-tools": ["Bunu denemek isterim", "Prompt paylaşır mısınız?"],
  jobs: ["İlgileniyorum, DM atabilir miyim?"],
  tavsiyeler: ["Listeme ekledim, teşekkürler", "Bir de şunu öneririm:"],
};

interface ApiChannel {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  type: "text" | "announcement";
}

interface ApiMessage {
  id: number;
  body: string;
  createdAt: string;
  timestamp: string;
  authorUserId: number;
  authorName: string;
  authorInitials: string;
  authorRole: "admin" | "member";
}

function AiDigestEmpty({ channelLabel }: { channelLabel: string }) {
  const t = useT();
  return (
    <div className="relative mx-4 mb-4 overflow-hidden panel-glass p-4">
      <AmbientCardBackground />
      <div className="relative z-10 flex items-start gap-3">
        <div className="relative flex size-7 shrink-0 items-center justify-center panel-glass">
          <Sparkles className="size-3.5 text-[var(--ink-body)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("chat.aiDigest", { name: channelLabel })}
          </p>
          <p className="text-sm leading-relaxed text-[var(--ink-body)]">
            {t("chat.aiDigestHint")}
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  prevAuthorUserId,
}: {
  msg: ApiMessage;
  prevAuthorUserId?: number;
}) {
  const t = useT();
  const showHeader = prevAuthorUserId !== msg.authorUserId;

  return (
    <div className="group flex gap-3 px-4 py-1 transition-colors hover:bg-[var(--ink)]/[0.02]">
      <div className="mt-0.5 w-7 shrink-0">
        {showHeader && (
          <PersonAvatar
            name={msg.authorName}
            initials={msg.authorInitials}
            className="size-7 text-label"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {showHeader && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className="text-sm font-medium text-[var(--ink)]">{msg.authorName}</span>
            {msg.authorRole === "admin" && (
              <span className="border border-[var(--inner-green)]/30 px-1 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
                {t("common.admin")}
              </span>
            )}
            <span className="font-mono text-label text-[var(--ink-muted)]">{msg.timestamp}</span>
          </div>
        )}
        <p className="text-sm leading-relaxed text-[var(--ink-strong)] whitespace-pre-wrap">{msg.body}</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const {
    data: channelsData,
    isLoading: channelsLoading,
    isError: channelsError,
    error: channelsErr,
    refetch: refetchChannels,
  } = useApiQuery<{ channels: ApiChannel[] }>(["channels"], "/api/channels");

  const channels = channelsData?.channels ?? [];
  const channel = channels.find((c) => c.id === activeChannelId) ?? channels[0] ?? null;
  const resolvedChannelId = channel?.id ?? null;

  useEffect(() => {
    if (activeChannelId == null && channels[0]) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesErr,
    refetch: refetchMessages,
  } = useApiQuery<{ messages: ApiMessage[] }>(
    ["channel-messages", resolvedChannelId],
    `/api/channels/${resolvedChannelId}/messages`,
    { enabled: resolvedChannelId != null },
  );

  const channelMessages = messagesData?.messages ?? [];
  const suggestions = channel ? (CHANNEL_SUGGESTIONS[channel.name] ?? []) : [];

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [resolvedChannelId, channelMessages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || resolvedChannelId == null || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(apiUrl(`/api/channels/${resolvedChannelId}/messages`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("chat.sendError"));
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["channel-messages", resolvedChannelId] });
    } catch (e: any) {
      setSendError(e.message ?? t("chat.sendError"));
    } finally {
      setSending(false);
    }
  };

  if (channelsLoading && channels.length === 0) {
    return (
      <div className="p-6">
        <LoadingBlock label={t("chat.loadingChannels")} />
      </div>
    );
  }

  if (channelsError) {
    return (
      <div className="p-6">
        <ErrorState
          message={channelsErr instanceof Error ? channelsErr.message : t("chat.loadChannelsError")}
          onRetry={() => refetchChannels()}
        />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="p-6">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
          {t("chat.emptyChannels")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-x-clip">
      <div className="flex min-h-0 flex-1">
        <aside className="panel-glass-strong hidden w-[220px] shrink-0 flex-col border-r border-[var(--ink)]/[0.08] md:flex">
          <div className="border-b border-[var(--ink)]/[0.08] px-4 py-3">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">{t("chat.channels")}</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannelId(ch.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                  resolvedChannelId === ch.id
                    ? "bg-[var(--ink)] text-[var(--bone)]"
                    : "text-[var(--ink-muted)] hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]",
                )}
              >
                {ch.type === "announcement" ? (
                  <Volume2 className="size-3 shrink-0" />
                ) : (
                  <Hash className="size-3 shrink-0" />
                )}
                <span className="flex-1 truncate font-mono text-caption">{ch.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-[52px] min-w-0 items-center justify-between gap-2 border-b border-[var(--ink)]/[0.08] px-4">
            <div className="flex min-w-0 items-center gap-2">
              {channel.type === "announcement" ? (
                <Volume2 className="size-4 shrink-0 text-[var(--ink-body)]" />
              ) : (
                <Hash className="size-4 shrink-0 text-[var(--ink-body)]" />
              )}
              <span className="truncate font-serif text-sm text-[var(--ink)]">{channel.name}</span>
              <span className="hidden truncate text-sm text-[var(--ink-muted)] sm:block">
                {channel.description ? ` · ${channel.description}` : ""}
              </span>
            </div>
            <button
              type="button"
              className="shrink-0 text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
              aria-label={t("common.search")}
            >
              <Search className="size-4" />
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-[var(--ink)]/[0.08] px-2 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannelId(ch.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 font-mono text-sm transition-colors",
                  resolvedChannelId === ch.id
                    ? "bg-[var(--ink)] text-[var(--bone)]"
                    : "text-[var(--ink-muted)] hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]",
                )}
              >
                {ch.type === "announcement" ? <Volume2 className="size-3" /> : <Hash className="size-3" />}
                {ch.name}
              </button>
            ))}
          </div>

          <div ref={messagesRef} className="flex-1 overflow-y-auto py-4">
            {channelMessages.length === 0 && !messagesLoading && <AiDigestEmpty channelLabel={channel.name} />}
            {messagesLoading && channelMessages.length === 0 && (
              <div className="px-4">
                <LoadingBlock label={t("chat.loadingMessages")} />
              </div>
            )}
            {messagesError && (
              <div className="px-4">
                <ErrorState
                  message={messagesErr instanceof Error ? messagesErr.message : t("chat.loadMessagesError")}
                  onRetry={() => refetchMessages()}
                />
              </div>
            )}
            {!messagesLoading && !messagesError && channelMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Hash className="mx-auto mb-3 size-8 text-[var(--ink-subtle)]" />
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("chat.emptyChannel", { name: channel.name })}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">{t("chat.emptyHint")}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {channelMessages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    prevAuthorUserId={i > 0 ? channelMessages[i - 1].authorUserId : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--ink)]/[0.08] p-4">
            {sendError && (
              <p className="mb-2 font-mono text-label text-[var(--error-ink)]" role="alert">
                {sendError}
              </p>
            )}
            {suggestions.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <Sparkles className="size-3 shrink-0 text-[var(--success-ink)]/70" />
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraft(s)}
                    className="panel-glass px-2.5 py-1 font-mono text-label text-[var(--ink-muted)] transition-colors hover:border-[var(--inner-green)]/40 hover:text-[var(--ink)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="panel-glass flex items-end gap-3 p-3 transition-colors focus-within:border-[var(--ink)]/40">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={t("chat.placeholder", { name: channel.name })}
                rows={1}
                disabled={sending}
                className="min-w-0 flex-1 resize-none bg-transparent font-sans text-base text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none disabled:opacity-50 sm:text-sm"
                style={{ lineHeight: "1.5" }}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!draft.trim() || sending}
                className="flex size-8 shrink-0 items-center justify-center bg-[var(--ink)] text-[var(--bone)] transition-opacity hover:opacity-80 disabled:opacity-25"
                aria-label={t("chat.send")}
              >
                <Send className="size-3.5" />
              </button>
            </div>
            <p className="mt-1.5 font-mono text-label text-[var(--ink-subtle)]">
              {t("chat.sendHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
