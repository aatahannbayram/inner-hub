# Transactional mail — Resend (giden) + Hostinger (gelen kutu)

## Mimari

| Rol | Sağlayıcı |
|-----|-----------|
| Gelen kutu / MX / webmail | Hostinger Email (`mx1/mx2.hostinger.com`, apex `@inner.digital`) |
| Uygulamadan giden transactional | **Resend** — From: `noreply@mail.inner.digital` |
| Fallback (key yoksa) | Hostinger SMTP (`smtp.hostinger.com`, apex mailbox) |

Şablonlar (`templates.ts`) ve `notify*` API değişmez; yalnızca [`transport.ts`](./transport.ts) gönderir.

DNS: alan adı GoDaddy’de olsa bile **NS Hostinger’daysa** kayıtlar Hostinger DNS Zone’a (`inner.digital`) eklenir. GoDaddy zone kullanılmaz.

## Ne gönderilir

| Olay | Alıcı | Şablon |
|------|--------|--------|
| Yeni davet talebi | Başvuran | `invite.received` |
| Yeni davet talebi | `NOTIFY_EMAIL` | `admin.new_request` |
| Admin onay | Başvuran | `invite.approved` |
| Admin red | Başvuran | `invite.rejected` |
| Şifre sıfırlama | Kullanıcı | `auth.password_reset` |
| Canlı oturum hatırlatması | Kayıtlı üye | `live.session_reminder` |
| Tanışma talebi | Üye | `match.intro_received` |
| Tanışma talebi | `NOTIFY_EMAIL` | `match.intro_admin` |
| Etkinlik kaydı | Üye | `event.registered` |
| Kurs kaydı | Üye | `course.enrolled` |
| Haftalık digest (Pazartesi) | `notifDigest` açık üyeler | `weekly.digest` |

Lifecycle (digest) maillerinde `List-Unsubscribe` + One-Click vardır. Transactional (davet, şifre, kayıt) mailinde yoktur.

Cron:

```
# Her Pazartesi 08:00 Europe/Istanbul
0 8 * * 1 curl -sS -X POST "$APP_URL/api/jobs/weekly-digest" -H "X-Job-Secret: $CRON_SECRET" -H "Content-Type: application/json"
# Canlı hatırlatma — her 15 dk
*/15 * * * * curl -sS -X POST "$APP_URL/api/jobs/live-reminders" -H "X-Job-Secret: $CRON_SECRET"
```

## Env

```
RESEND_API_KEY=re_xxxxxxxx
# Opsiyonel; yoksa MAIL_FROM kullanılır
# RESEND_FROM="inner hub <noreply@mail.inner.digital>"

MAIL_FROM=noreply@mail.inner.digital
MAIL_FROM_NAME=inner hub
MAIL_REPLY_TO=support@inner.digital
NOTIFY_EMAIL=hey@inner.digital
APP_URL=https://inner.digital
CRON_SECRET=
MAIL_UNSUB_SECRET=
MAIL_PHYSICAL_ADDRESS=inner hub, İstanbul

# Fallback (RESEND_API_KEY yoksa) — Hostinger apex SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@inner.digital
SMTP_PASS=
```

## Resend domain kurulumu

1. [resend.com/domains](https://resend.com/domains) → Add → **`mail.inner.digital`** (apex değil)
2. Region: Ireland · Return-Path: `send` · Tracking: `links` (sadece kısa etiket, noktasız)
3. DNS kayıtlarını **Hostinger → inner.digital → DNS Zone**’a ekle (MX apex’e dokunma)
4. Enable Receiving: **kapalı** (gelen kutu Hostinger’da)
5. Domain **Verified** → API key → env `RESEND_API_KEY` + `MAIL_FROM=noreply@mail.inner.digital` → API restart

Hostinger’da `mail` için **mailbox açma** gerekmez. Website “alt alan adı” da zorunlu değil; sadece DNS yeterli.

## Doğrulama

```bash
node artifacts/api-server/scripts/generate-mail-preview.mjs
node --env-file=.env artifacts/api-server/scripts/test-mail-pipeline.mjs --to sen@mail.com
```

Gmail → ⋮ → **Orijinali göster** → From `mail.inner.digital`, `DKIM: PASS` (Resend).

## Kod notları

- HTML + text multipart
- Transactional’da `List-Unsubscribe` yok
- `Reply-To: support@inner.digital`
