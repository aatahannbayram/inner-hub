import { useState, useRef, useEffect } from "react";
import { Send, Hash, Volume2, Pin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  authorName: string;
  authorInitials: string;
  authorRole: "admin" | "member";
  content: string;
  timestamp: string;
  isPinned?: boolean;
}

interface Channel {
  id: string;
  label: string;
  description: string;
  unread: number;
  type: "text" | "announcement";
}

const CHANNELS: Channel[] = [
  { id: "genel", label: "genel", description: "Genel topluluk sohbeti", unread: 3, type: "text" },
  { id: "duyurular", label: "duyurular", description: "Önemli duyurular ve haberler", unread: 1, type: "announcement" },
  { id: "girisimler", label: "girişimler", description: "Startup haberleri ve milestone paylaşımları", unread: 0, type: "text" },
  { id: "ai-tools", label: "ai-tools", description: "Yapay zeka araçları ve denemeler", unread: 7, type: "text" },
  { id: "jobs", label: "jobs", description: "İş ve staj fırsatları", unread: 0, type: "text" },
  { id: "tavsiyeler", label: "tavsiyeler", description: "Kitap, podcast, araç önerileri", unread: 2, type: "text" },
];

const MESSAGES_BY_CHANNEL: Record<string, Message[]> = {
  genel: [
    {
      id: 1,
      authorName: "Ata Han Bayram",
      authorInitials: "AT",
      authorRole: "admin",
      content: "inner·hub'a hoş geldiniz 👋 Bu platformu birlikte inşa ediyoruz — geri bildirimlerinizi bekliyorum.",
      timestamp: "09:00",
      isPinned: true,
    },
    {
      id: 2,
      authorName: "Zeynep Arslan",
      authorInitials: "ZA",
      authorRole: "member",
      content: "Harika bir başlangıç! Geçen hafta AWS Activate kredinizi kullanan oldu mu? Ben başvurdum, henüz dönüş yok.",
      timestamp: "10:14",
    },
    {
      id: 3,
      authorName: "Mert Demir",
      authorInitials: "MD",
      authorRole: "member",
      content: "Ben de başvurdum @Zeynep. 2-3 haftada dönüyorlar genelde. Startup programından geliyorsanız daha hızlı.",
      timestamp: "10:22",
    },
    {
      id: 4,
      authorName: "Ayşe Kaya",
      authorInitials: "AK",
      authorRole: "member",
      content: "AI & Girişimcilik Zirvesi için heyecanlıyım. Eylül öncesi bir hazırlık session'ı yapabilir miyiz?",
      timestamp: "11:05",
    },
    {
      id: 5,
      authorName: "Mert Demir",
      authorInitials: "MD",
      authorRole: "member",
      content: "+1. Pitch deck review çok işe yarar özellikle yatırımcı kısmı için.",
      timestamp: "11:09",
    },
    {
      id: 6,
      authorName: "Ata Han Bayram",
      authorInitials: "AT",
      authorRole: "admin",
      content: "Harika fikir — Ağustos başında bir workshop planlayabiliriz. Etkinlikler sekmesine ekliyorum.",
      timestamp: "11:31",
    },
    {
      id: 7,
      authorName: "Zeynep Arslan",
      authorInitials: "ZA",
      authorRole: "member",
      content: "Biz de Hipo'dan 2 kişi katılabiliriz. Co-founder olarak pitch deneyimi paylaşabiliriz.",
      timestamp: "11:45",
    },
  ],
  duyurular: [
    {
      id: 1,
      authorName: "Ata Han Bayram",
      authorInitials: "AT",
      authorRole: "admin",
      content: "🎉 inner·hub paneli canlıya geçti! Tüm sayfalar hazır — ayrıcalıklar, etkinlikler ve kurs içerikleri erişime açık.",
      timestamp: "08:00",
      isPinned: true,
    },
    {
      id: 2,
      authorName: "Ata Han Bayram",
      authorInitials: "AT",
      authorRole: "admin",
      content: "📅 Networking Kahvaltısı — 5 Ağustos, Online. Kayıt için Etkinlikler sayfasına bakın.",
      timestamp: "08:05",
    },
  ],
  "ai-tools": [
    {
      id: 1,
      authorName: "Mert Demir",
      authorInitials: "MD",
      authorRole: "member",
      content: "Claude 4 Opus ile bir haftalık deney yaptım. Kod üretimi konusunda GPT-4o'dan belirgin şekilde iyi.",
      timestamp: "09:30",
    },
    {
      id: 2,
      authorName: "Ayşe Kaya",
      authorInitials: "AK",
      authorRole: "member",
      content: "Cursor + Claude kombinasyonu ile proje sürem %40 düştü. Kim denemek isterse elimde prompts var.",
      timestamp: "10:00",
    },
    {
      id: 3,
      authorName: "Zeynep Arslan",
      authorInitials: "ZA",
      authorRole: "member",
      content: "Runway Gen-3 video üretimi için denedim — presenter video için mükemmel ama avatar kalitesi hâlâ sınırlı.",
      timestamp: "10:45",
    },
    {
      id: 4,
      authorName: "Mert Demir",
      authorInitials: "MD",
      authorRole: "member",
      content: "Perplexity Pro şirket araştırması için vazgeçilmez oldu. Deal flow analizi yaparken saatler kazandırıyor.",
      timestamp: "11:20",
    },
    {
      id: 5,
      authorName: "Ayşe Kaya",
      authorInitials: "AK",
      authorRole: "member",
      content: "Bir de Bolt.new deneyin — prototip hızı inanılmaz. inner·hub gibi bir panel 2 saatte çıkıyor 😄",
      timestamp: "11:55",
    },
    {
      id: 6,
      authorName: "Mert Demir",
      authorInitials: "MD",
      authorRole: "member",
      content: "Bence bu kanalı haftada bir kez 'Haftanın AI Aracı' formatında özetlersek daha değerli olur. Ne düşünürsünüz?",
      timestamp: "14:10",
    },
    {
      id: 7,
      authorName: "Zeynep Arslan",
      authorInitials: "ZA",
      authorRole: "member",
      content: "+1! Digest formatı harika olur. Ben ilk haftayı üstlenebilirim.",
      timestamp: "14:33",
    },
  ],
  girisimler: [
    {
      id: 1,
      authorName: "Zeynep Arslan",
      authorInitials: "ZA",
      authorRole: "member",
      content: "Hipo olarak bu ay 50. müşteriyi geçtik 🎉 B2B SaaS için önemli bir milestone. Sonraki hedef ARR $500K.",
      timestamp: "10:00",
    },
  ],
  jobs: [],
  tavsiyeler: [
    {
      id: 1,
      authorName: "Ayşe Kaya",
      authorInitials: "AK",
      authorRole: "member",
      content: "Bu hafta bitirdiğim kitap: 'The Mom Test' — müşteri görüşmesi yapmak isteyen herkese zorunlu okuma.",
      timestamp: "09:15",
    },
    {
      id: 2,
      authorName: "Mert Demir",
      authorInitials: "MD",
      authorRole: "member",
      content: "Podcast: Acquired — Stripe ve Nvidia bölümleri. Şirket inşasına dair en derin analizler burada.",
      timestamp: "11:00",
    },
  ],
};

function Avatar({ initials, role, size = "sm" }: { initials: string; role: "admin" | "member"; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-mono uppercase",
        role === "admin"
          ? "bg-[var(--ink)] text-[var(--bone)]"
          : "bg-[var(--ink)]/10 text-[var(--ink)]",
        size === "sm" ? "size-7 text-[9px]" : "size-8 text-[10px]",
      )}
    >
      {initials}
    </div>
  );
}

function MessageBubble({ msg, prevAuthorId }: { msg: Message; prevAuthorId?: number }) {
  const showHeader = prevAuthorId !== msg.id;

  return (
    <div className="group flex gap-3 px-4 py-1 hover:bg-[var(--ink)]/[0.02] transition-colors">
      <div className="mt-0.5 w-7 shrink-0">
        {showHeader && <Avatar initials={msg.authorInitials} role={msg.authorRole} />}
      </div>
      <div className="min-w-0 flex-1">
        {showHeader && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className="text-sm font-medium text-[var(--ink)]">{msg.authorName}</span>
            {msg.authorRole === "admin" && (
              <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--inner-green)] border border-[var(--inner-green)]/30 px-1">
                Admin
              </span>
            )}
            <span className="font-mono text-[10px] text-[var(--ink)]/30">{msg.timestamp}</span>
            {msg.isPinned && <Pin className="size-2.5 text-[var(--ink)]/30" />}
          </div>
        )}
        <p className="text-sm leading-relaxed text-[var(--ink)]/80">{msg.content}</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState("genel");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(MESSAGES_BY_CHANNEL);
  const bottomRef = useRef<HTMLDivElement>(null);

  const channel = CHANNELS.find((c) => c.id === activeChannel)!;
  const channelMessages = messages[activeChannel] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel, channelMessages.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const newMsg: Message = {
      id: Date.now(),
      authorName: "Ata Han Bayram",
      authorInitials: "AT",
      authorRole: "admin",
      content: text,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] ?? []), newMsg],
    }));
    setDraft("");
  };

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-60px)] sm:-mx-6 lg:-mx-8 lg:-my-8">
      {/* Channel sidebar */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[var(--ink)]/[0.08] bg-[var(--bone)] md:flex">
        <div className="border-b border-[var(--ink)]/[0.08] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">Kanallar</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                activeChannel === ch.id
                  ? "bg-[var(--ink)] text-[var(--bone)]"
                  : "text-[var(--ink)]/50 hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]",
              )}
            >
              {ch.type === "announcement" ? (
                <Volume2 className="size-3 shrink-0" />
              ) : (
                <Hash className="size-3 shrink-0" />
              )}
              <span className="flex-1 truncate font-mono text-[11px]">{ch.label}</span>
              {ch.unread > 0 && activeChannel !== ch.id && (
                <span className="flex size-4 items-center justify-center bg-[var(--ink)] font-mono text-[8px] text-[var(--bone)]">
                  {ch.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Channel header */}
        <div className="flex h-[52px] items-center justify-between border-b border-[var(--ink)]/[0.08] px-4">
          <div className="flex items-center gap-2">
            {channel.type === "announcement" ? (
              <Volume2 className="size-4 text-[var(--ink)]/40" />
            ) : (
              <Hash className="size-4 text-[var(--ink)]/40" />
            )}
            <span className="font-mono text-sm text-[var(--ink)]">{channel.label}</span>
            <span className="hidden font-mono text-[10px] text-[var(--ink)]/30 sm:block">
              — {channel.description}
            </span>
          </div>
          <button className="text-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors">
            <Search className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {channelMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Hash className="mx-auto mb-3 size-8 text-[var(--ink)]/10" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/30">
                  #{channel.label} henüz boş
                </p>
                <p className="mt-1 text-sm text-[var(--ink)]/30">İlk mesajı sen gönder.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {channelMessages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  prevAuthorId={i > 0 ? channelMessages[i - 1].id : undefined}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[var(--ink)]/[0.08] p-4">
          <div className="flex items-end gap-3 border border-[var(--ink)]/15 bg-[var(--bone)] p-3 focus-within:border-[var(--ink)]/40 transition-colors">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`#${channel.label} kanalına mesaj gönder…`}
              rows={1}
              className="flex-1 resize-none bg-transparent font-sans text-sm text-[var(--ink)] placeholder:text-[var(--ink)]/30 focus:outline-none"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="flex size-8 shrink-0 items-center justify-center bg-[var(--ink)] text-[var(--bone)] transition-opacity hover:opacity-80 disabled:opacity-25"
              aria-label="Gönder"
            >
              <Send className="size-3.5" />
            </button>
          </div>
          <p className="mt-1.5 font-mono text-[9px] text-[var(--ink)]/25">
            Enter ile gönder · Shift+Enter yeni satır
          </p>
        </div>
      </div>
    </div>
  );
}
