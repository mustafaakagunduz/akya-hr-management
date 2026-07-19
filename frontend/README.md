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

- **/login** — Giriş
- **/register** — 10 alanlık kayıt formu
- **/panel** — Personel paneli: izin talep formu + taleplerim tablosu
- **/yonetici** — Yönetici paneli: bekleyen talepler, onayla/reddet (sadece MANAGER rolü)

## Teknik Notlar

- **i18n:** Arayüzdeki tüm metinler `react-i18next` ile `src/locales/tr.json` dosyasından okunur; bileşenlerde gömülü statik metin bulunmaz.
- **Kimlik doğrulama:** JWT token `localStorage`'da tutulur, sayfa yenilendiğinde `/auth/me` ile oturum doğrulanır.
- Korumalı rotalar: token yoksa `/login`'e yönlendirilir; EMPLOYEE rolü `/yonetici`'ye giremez.

## E2E Testler (Playwright)

```bash
npx playwright install chromium   # ilk kurulumda bir kez
npm run test:e2e
```

Testler `e2e/` klasöründedir ve gerçek backend + frontend'e karşı çalışır (`playwright.config.ts` frontend dev sunucusunu otomatik başlatır, backend'in ayrıca `npm run start:dev` ile çalışıyor olması gerekir). Kapsanan senaryolar:

- Kayıt ol → giriş yap
- Personel izin talebi oluşturur, "Taleplerim" tablosunda BEKLEMEDE rozetiyle görür
- Yönetici bekleyen talebi onaylar
- Personel onaylanmış talebi APPROVED rozetiyle görür
- Hatalı giriş bilgileri ve korumasız rota erişimi

## Deploy (Vercel)

1. [Vercel](https://vercel.com)'de yeni proje oluşturun, bu repodaki `frontend/` klasörünü root directory olarak seçin.
2. Framework preset: **Vite**. Build komutu: `npm run build`, output dizini: `dist`.
3. Environment Variables'a `VITE_API_URL` değişkenini backend'in Render.com URL'si ile ekleyin.
4. Deploy edin.
