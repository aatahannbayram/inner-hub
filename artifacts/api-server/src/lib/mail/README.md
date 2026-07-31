# Transactional mail — Resend (giden) + Hostinger (gelen kutu)

## Mimari

| Rol | Sağlayıcı |
|-----|-----------|
| Gelen kutu / MX / webmail | Hostinger Email (`mx1/mx2.hostinger.com`) |
| Uygulamadan giden transactional | **Resend** (`RESEND_API_KEY`) |
| Fallback (key yoksa) | Hostinger SMTP (`smtp.hostinger.com`) |

Şablonlar (`templates.ts`) ve `notify*` API değişmez; yalnızca [`transport.ts`](./transport.ts) gönderir.

## Ne gönderilir

| Olay | Alıcı | Şablon |
|------|--------|--------|
| Yeni davet talebi | Başvuran | `invite.received` |
| Yeni davet talebi | `NOTIFY_EMAIL` | `admin.new_request` |
| Admin onay | Başvuran | `invite.approved` |
| Admin red | Başvuran | `invite.rejected` |
| Şifre sıfırlama | Kullanıcı | `auth.password_reset` |
| Canlı oturum hatırlatması | Kayıtlı üye | `live.session_reminder` |

## Env

```
# Öncelik: Resend
RESEND_API_KEY=re_xxxxxxxx
# Opsiyonel; yoksa MAIL_FROM kullanılır (domain Resend’de verified olmalı)
# RESEND_FROM="inner hub <noreply@inner.digital>"

MAIL_FROM=noreply@inner.digital
MAIL_FROM_NAME=inner hub
MAIL_REPLY_TO=support@inner.digital
NOTIFY_EMAIL=hey@inner.digital
APP_URL=https://inner.digital

# Fallback (RESEND_API_KEY yoksa)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@inner.digital
SMTP_PASS=
```

## Resend domain kurulumu (manuel, ~10 dk)

1. [resend.com](https://resend.com) → Domains → **Add** `inner.digital`
2. Dashboard’daki DNS kayıtlarını ekle (genelde DKIM CNAME’ler).
3. **MX değiştirme** — Hostinger MX kalsın (gelen kutu).
4. **SPF — tek satır, birleştir** (iki ayrı SPF yazma):

Şu an:
```
v=spf1 include:_spf.mail.hostinger.com ~all
```

Hedef (Resend UI’daki exact `include` değerini kullan; çoğu zaman `amazonses.com`):
```
v=spf1 include:_spf.mail.hostinger.com include:amazonses.com ~all
```

5. Resend’de domain **Verified** olana kadar bekle.
6. API key oluştur → prod env: `RESEND_API_KEY` → API restart.
7. `MAIL_FROM` / `RESEND_FROM` verified domain’den olmalı (`@inner.digital`).

Hostinger `hostingermail-a` DKIM kaydını **silme** (webmail gideni için).

## Doğrulama

```bash
# Preview HTML
node artifacts/api-server/scripts/generate-mail-preview.mjs

# Resend veya SMTP ile test
node --env-file=.env artifacts/api-server/scripts/test-mail-pipeline.mjs --to sen@mail.com
```

Gmail → spam/inbox mail → ⋮ → **Orijinali göster** → `DKIM: PASS` (Resend selector), SPF/DMARC uyumu.  
https://www.mail-tester.com hedef ≥ 8/10.

## Kod notları

- HTML + text multipart
- Transactional’da `List-Unsubscribe` yok
- `Reply-To: support@inner.digital`
