# Transactional mail — deliverability checklist (inner hub)

## Ne gönderilir
| Olay | Alıcı | Şablon |
|------|--------|--------|
| Yeni davet talebi | Başvuran | `invite.received` |
| Yeni davet talebi | `NOTIFY_EMAIL` | `admin.new_request` |
| Admin onay | Başvuran | `invite.approved` |
| Admin red | Başvuran | `invite.rejected` |

SMTP yoksa mail atlanır (API hata vermez). Aynı status tekrar PATCH edilirse mail **yeniden gitmez**.

## Env
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@inner.digital
SMTP_PASS=
NOTIFY_EMAIL=hey@inner.digital
MAIL_FROM=noreply@inner.digital
MAIL_FROM_NAME=inner hub
MAIL_REPLY_TO=support@inner.digital
APP_URL=https://inner.digital
```

Hostinger SMTP: `smtp.hostinger.com`, port **465** (SSL) veya **587** (STARTTLS).  
`MAIL_FROM` = `SMTP_USER` (aynı mailbox / aynı domain).
Admin bildirimleri: `NOTIFY_EMAIL=hey@inner.digital`.
## Spam’e düşmemek — Hostinger + `inner.digital`

DNS durumu (kontrol tarihi: yerel dig):
- SPF: `v=spf1 include:_spf.mail.hostinger.com ~all` → **var**
- MX: Hostinger → **var**
- DKIM: yaygın selector’larda **yok / bulunamadı** → Hostinger’dan ekle
- DMARC: **yok** → TXT ekle

### 1) Mailbox
hPanel → **Emails** → `noreply@inner.digital` (veya `hello@…`) oluştur.  
`support@inner.digital` Reply-To için ayrı veya alias.

### 2) DKIM (zorunlu)
hPanel → Emails → domain → **DNS / DKIM** → Enable.  
Hostinger’ın verdiği TXT’i domain DNS’ine ekle (çoğu zaman otomatik).  
Doğrulama: `dig TXT <selector>._domainkey.inner.digital`

### 3) DMARC (zorunlu, yumuşak başla)
TXT adı: `_dmarc.inner.digital`  
Değer:
```
v=DMARC1; p=none; rua=mailto:support@inner.digital; fo=1
```
Birkaç hafta sonra `p=quarantine` düşün.

### 4) From hizası
- Gmail/Outlook SMTP ile `@gmail.com` From **kullanma** (spam + “via”).
- Prod’da yalnızca `@inner.digital` + Hostinger SMTP.

### 5) İçerik (kod zaten yapıyor)
- HTML + text multipart
- Onayda `invite_codes` tablosuna kişiye özel kod üretilir (email-bound, tek kullanımlık, ~30 gün).
- Onay mailinde bu kod gider. Kayıt: aynı e-posta + kod. `INVITE_PASSCODE` yalnızca opsiyonel master fallback.
- `Reply-To`, `Message-ID@inner.digital`, `List-Unsubscribe`
- Sakin konu satırları

### 6) Post-send kontrol
Alıcıda (Gmail): mail → ⋮ → **Orijinali göster** → `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`.  
https://www.mail-tester.com ile bir test at (hedef ≥ 8/10).

## Test
```bash
# Önizleme HTML
node artifacts/api-server/scripts/generate-mail-preview.mjs

# SMTP doldurduktan sonra 4 şablon gönder
node --env-file=.env artifacts/api-server/scripts/test-mail-pipeline.mjs --to sen@mail.com
```

Canlı akış: `/invitation` talep → alındı + admin; panel Applications onay/red → ikinci mail.
