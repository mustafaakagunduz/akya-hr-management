# İK İzin Yönetim Sistemi

Bir şirketin İnsan Kaynakları departmanı için bulutta çalışan izin yönetim sistemi. Personel 10 parametrelik kayıt formuyla sisteme kaydolur, günlük/yıllık izin talebi oluşturur; talepler yöneticinin onayına düşer.

Monorepo yapısı:

```
/backend   → NestJS + TypeORM + PostgreSQL (Neon) API
/frontend  → React (Vite) + TypeScript arayüz
```

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React (Vite) + TypeScript, i18next |
| Backend | NestJS (TypeScript) |
| ORM | TypeORM |
| Veritabanı | PostgreSQL (Neon.tech) |
| Kimlik Doğrulama | JWT + bcrypt |
| Test | Playwright (e2e) |
| Deploy | Backend → Render.com, Frontend → Vercel |

## Hızlı Başlangıç

```bash
# backend
cd backend
npm install
cp .env.example .env   # gerçek DATABASE_URL ve JWT_SECRET değerlerini girin
npm run dev

# frontend (ayrı terminalde)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Detaylı kurulum, ortam değişkenleri, API listesi ve deploy talimatları için:

- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

## Demo Yönetici Hesabı

- E-posta: `admin@sirket.com`
- Şifre: `Admin123!`

## Demo Personel Hesabı

Uygulama ilk açılışta 3 demo personel (EMPLOYEE) hesabı da oluşturur, hepsinin şifresi `Personel123!`. Örnek:

- E-posta: `ayse.yilmaz@sirket.com`
- Şifre: `Personel123!`
