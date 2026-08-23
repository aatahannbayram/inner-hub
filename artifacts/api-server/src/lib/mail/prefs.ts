import type { SettingsPrefs } from "../../routes/settings";

export type MailChannel = "digest" | "match" | "events" | "capital";

/** Şifre / davet gibi zorunlu transactional mailler prefs'e bakmaz. */
export function wantsEmail(prefs: SettingsPrefs, channel: MailChannel): boolean {
  if (!prefs.notifEmail) return false;
  if (channel === "digest") return prefs.notifDigest;
  if (channel === "match") return prefs.notifMatch;
  if (channel === "events") return prefs.notifEvents;
  if (channel === "capital") return prefs.notifCapital;
  return true;
}
