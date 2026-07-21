# İK İzin Yönetim Sistemi — Frontend

React (Vite) + TypeScript ile geliştirilmiş izin yönetim sistemi arayüzü.

## Kurulum

```bash
npm install
```

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

### Ortam Değişkenleri

| Değişken | Açıklama |
|---|---|
| `VITE_API_URL` | Backend API adresi (ör. `http://localhost:3000`) |

## Çalıştırma

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır. Backend'in ayrıca çalışıyor olması gerekir (bkz. `../backend/README.md`).

## Sayfalar

- **/login**, **/register** — Giriş ve 10 alanlık kayıt formu
- **/my-leaves** — Bekleyen taleplerim (switch ile tüm statüler görüntülenebilir), yıllık izin bakiyesi
- **/create-leave** — İzin talebi oluşturma formu
- **/leave-history** — Geçmiş izinler; MANAGER için switch ile kendi geçmişi ↔ tüm personelin geçmişi arasında geçiş, şu an izinde olanlar vurgulanır
- **/leave-requests** — Bekleyen talepler, onayla/reddet (sadece MANAGER)
- **/users** — Tüm kullanıcılar: düzenle, şifre/bakiye sıfırla, aktif/pasif yap (sadece MANAGER)
- **/profile**, **/settings** — Profil bilgisi/şifre değişikliği, tema ve dil tercihi

## Teknik Notlar

- **i18n:** Arayüzdeki tüm metinler `react-i18next` ile `src/locales/tr.json` ve `src/locales/en.json` dosyalarından okunur; bileşenlerde gömülü statik metin bulunmaz. Dil, Ayarlar sayfasından veya navbar'daki switch'ten değiştirilebilir.
- **Kimlik doğrulama:** JWT token `localStorage`'da tutulur, sayfa yenilendiğinde `/auth/me` ile oturum doğrulanır.
- Korumalı rotalar: token yoksa `/login`'e yönlendirilir; EMPLOYEE rolü `/leave-requests` ve `/users`'a giremez.
- **Anlık bildirimler:** `socket.io-client` ile backend'e JWT'li bir WebSocket bağlantısı kurulur (`SocketContext`). Personel izin talebi oluşturduğunda yöneticinin ekranındaki liste, yönetici onay/red verdiğinde de personelin ekranı sayfa yenilemeden otomatik güncellenir.
- **SPA yönlendirme:** `vercel.json` tüm path'leri `index.html`'e yönlendirir, aksi halde doğrudan `/my-leaves` gibi bir adrese gidildiğinde Vercel 404 döner.

## E2E Testler (Playwright)

```bash
npx playwright install chromium   # ilk kurulumda bir kez
npm run test:e2e
```

Testler `e2e/` klasöründedir ve gerçek backend + frontend'e karşı çalışır (`playwright.config.ts` frontend dev sunucusunu otomatik başlatır, backend'in ayrıca `npm run dev` ile çalışıyor olması gerekir — testler gerçek veritabanına yazar). Kapsanan senaryolar:

- **hr-flow:** kayıt → giriş → izin talebi oluştur → yönetici onaylar → personel geçmişte görür
- **calendar:** özel takvim bileşeni (açma/kapama, klavye ile gezinme, ay/yıl seçimi, dil desteği)
- **modals-toasts:** izin oluşturma/düzenleme/silme modalları, kullanıcı yönetimi modalları, toast bildirimleri
- **responsive-nav:** mobil çekmece menü ve masaüstü kenar çubuğu davranışı
- **theme-lang-viewport:** tema/dil/viewport kombinasyonlarında sayfa başlıklarının doğruluğu
- **login-errors:** hatalı giriş bilgileri ve korumasız rota erişimi

## Deploy (Vercel)

1. [Vercel](https://vercel.com)'de yeni proje oluşturun, bu repodaki `frontend/` klasörünü root directory olarak seçin.
2. Framework preset: **Vite**. Build komutu: `npm run build`, output dizini: `dist`.
3. Environment Variables'a `VITE_API_URL` değişkenini backend'in Render.com URL'si ile ekleyin.
4. Deploy edin.
