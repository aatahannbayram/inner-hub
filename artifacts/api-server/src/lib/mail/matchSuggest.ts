export type SuggestMember = {
  id: number;
  name: string;
  company: string | null;
  title: string | null;
  persona: string | null;
  skills: string | null;
  bio: string | null;
  allowMatch: boolean;
};

export type SuggestedMatch = {
  name: string;
  company: string;
  matchType: string;
  score: number;
  why: string;
};

const COMPLEMENT: Record<string, string[]> = {
  founder: ["investor", "builder", "company"],
  investor: ["founder", "company"],
  builder: ["founder", "company", "builder"],
  company: ["founder", "builder", "investor"],
};

const TYPE_LABEL: Record<string, string> = {
  investor: "Yatırımcı",
  founder: "Co-founder",
  builder: "İş birliği",
  company: "İş birliği",
};

function tokens(raw?: string | null): Set<string> {
  return new Set(
    (raw ?? "")
      .toLowerCase()
      .split(/[,;/|]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1),
  );
}

export function suggestMatches(self: SuggestMember, pool: SuggestMember[], limit = 3): SuggestedMatch[] {
  if (!self.allowMatch) return [];
  const selfSkills = tokens(self.skills);
  const selfPersona = (self.persona ?? "").toLowerCase();
  const scored: SuggestedMatch[] = [];

  for (const other of pool) {
    if (other.id === self.id || !other.allowMatch) continue;
    const persona = (other.persona ?? "").toLowerCase();
    const otherSkills = tokens(other.skills);
    const overlap = [...selfSkills].filter((s) => otherSkills.has(s)).slice(0, 3);
    const complementary = selfPersona ? (COMPLEMENT[selfPersona] ?? []).includes(persona) : false;

    let score = 62;
    if (complementary) score += 18;
    else if (persona && persona === selfPersona) score += 8;
    score += Math.min(12, overlap.length * 4);
    if (other.bio && other.bio.length > 40) score += 4;
    score = Math.min(96, score);
    if (score < 68 && overlap.length === 0 && !complementary) continue;

    const whyParts: string[] = [];
    if (complementary) whyParts.push("Odanla tamamlayıcı bir profil.");
    else if (persona && persona === selfPersona) whyParts.push("Aynı odadan; ortak zemin kurmak kolay.");
    if (overlap.length) whyParts.push(`Ortak zemin: ${overlap.join(", ")}.`);
    if (!whyParts.length) whyParts.push("Çember içinde görünür bir kesişim var.");

    scored.push({
      name: other.name,
      company: other.company?.trim() || other.title?.trim() || "",
      matchType: TYPE_LABEL[persona] || "İş birliği",
      score,
      why: whyParts.join(" "),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const uniq: SuggestedMatch[] = [];
  for (const row of scored) {
    if (uniq.some((u) => u.name === row.name)) continue;
    uniq.push(row);
    if (uniq.length >= limit) break;
  }
  return uniq;
}
