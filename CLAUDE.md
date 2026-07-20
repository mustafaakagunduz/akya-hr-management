# İK İzin Yönetim Sistemi — Proje Talimatları

## Projenin Amacı

Bir şirketin İnsan Kaynakları departmanı için bulutta çalışan bir **izin yönetim sistemi** geliştirilecek. Bu bir işe alım değerlendirme görevi (task) projesidir; kod temiz, anlaşılır ve savunulabilir olmalı.

### Görev Tanımı (işverenden gelen)

- İnsan Kaynakları alanında, bulutta bir yazılım hazırlanacak.
- Ücretsiz bir domain/subdomain üzerinde yayınlanabilir olacak.
- Personel, programa **10 parametrelik kayıt** yapabilecek.
- Personel **günlük ve yıllık izin** talebi girebilecek, talep **yöneticinin onayına** düşecek.
- Front-end ve back-end ayrı katmanlar olarak kullanılacak.

## Teknoloji Yığını (KESİN — değiştirme)

| Katman | Teknoloji |
|---|---|
| Frontend | React (Vite) + TypeScript |
| Backend | NestJS (TypeScript) |
| ORM | TypeORM |
| Veritabanı | PostgreSQL 18 (Neon.tech, bulutta) |
| Kimlik Doğrulama | JWT (@nestjs/jwt + passport-jwt), şifreler bcrypt ile hash'lenir |
| Deploy hedefi | Backend: Render.com — Frontend: Vercel |

## Proje Yapısı

Monorepo şeklinde iki klasör:

```
/backend   → NestJS uygulaması
/frontend  → React (Vite) uygulaması
```

### Backend modülleri

```
backend/src/
├── auth/        → register, login, JWT strateji, guard'lar
├── users/       → User entity ve kullanıcı servisi
├── leaves/      → LeaveRequest entity, izin CRUD ve onay/red işlemleri
├── common/      → RolesGuard, @Roles() decorator, ortak enum/yardımcılar
├── app.module.ts
└── main.ts      → ValidationPipe (whitelist: true) + enableCors()
```

## Veri Modeli

### User entity (`users` tablosu)

10 kayıt parametresi (kayıt formundaki alanlar):

1. `firstName` (string)
2. `lastName` (string)
3. `nationalId` (string, unique, 11 hane doğrulaması)
4. `email` (string, unique, e-posta doğrulaması)
5. `phone` (string)
6. `department` (string)
7. `position` (string)
8. `startDate` (date)
9. `birthDate` (date)
10. `password` (string — veritabanına **sadece bcrypt hash** yazılır)

Ek sistem alanları (form parametresi sayılmaz):

- `role`: enum `EMPLOYEE | MANAGER`, varsayılan `EMPLOYEE`
- `annualLeaveBalance`: int, varsayılan 14
- `createdAt`: CreateDateColumn

### LeaveRequest entity (`leave_requests` tablosu)

- `user` → ManyToOne(User), onDelete: CASCADE
- `type`: enum `DAILY | ANNUAL`
- `startDate`, `endDate` (date)
- `dayCount` (int — backend'de tarihlerden hesaplanır, frontend'den gelen değere güvenilmez)
- `description` (string, opsiyonel)
- `status`: enum `PENDING | APPROVED | REJECTED`, varsayılan `PENDING`
- `createdAt`: CreateDateColumn

## API Uç Noktaları

| Metot | Yol | Erişim | Açıklama |
|---|---|---|---|
| POST | `/auth/register` | Herkese açık | 10 alanlık kayıt formu, DTO ile doğrulama |
| POST | `/auth/login` | Herkese açık | email + şifre → JWT döner (payload: id, email, role) |
| GET | `/auth/me` | JWT | Giriş yapan kullanıcının bilgileri (şifre hariç) |
| POST | `/leaves` | JWT (EMPLOYEE + MANAGER) | Yeni izin talebi oluştur |
| GET | `/leaves/my` | JWT | Kullanıcının kendi talepleri (yeni → eski sıralı) |
| GET | `/leaves/pending` | JWT + MANAGER | Bekleyen tüm talepler (personel bilgisiyle birlikte) |
| PATCH | `/leaves/:id/approve` | JWT + MANAGER | Talebi onayla |
| PATCH | `/leaves/:id/reject` | JWT + MANAGER | Talebi reddet |

## İş Kuralları (mutlaka uygulanacak)

1. **Bakiye düşme:** ANNUAL izin onaylandığında `dayCount` kadar `annualLeaveBalance`'dan düşülür. Bu işlem **transaction içinde** yapılır (talep güncelleme + bakiye düşme atomik olmalı).
2. **Bakiye kontrolü:** ANNUAL talep oluşturulurken kalan bakiye yetersizse 400 hatası döner ("Yıllık izin bakiyeniz yetersiz").
3. **Tarih doğrulama:** `endDate >= startDate` olmalı; geçmiş tarihe izin girilemez.
4. **Çakışma kontrolü:** Aynı kullanıcının PENDING veya APPROVED durumundaki bir talebiyle tarih aralığı çakışan yeni talep reddedilir (400).
5. **Gün hesabı:** `dayCount` backend'de hesaplanır (basit takvim günü farkı + 1 yeterli, hafta sonu hesabına girme).
6. **Durum geçişi:** Sadece PENDING durumundaki talepler onaylanabilir/reddedilebilir; aksi halde 400.
7. **Yetki:** EMPLOYEE rolü başka kullanıcının taleplerini göremez; onay uç noktaları RolesGuard ile sadece MANAGER'a açık.
8. **Seed:** Uygulama ilk açılışta bir yönetici hesabı oluşturur (yoksa): email `admin@sirket.com`, şifre `Admin123!`, rol MANAGER. Bu bilgiler README'ye yazılır (demo amaçlı).

## Frontend Sayfaları

1. **Login** (`/login`) — email + şifre, hata mesajları Türkçe.
2. **Kayıt** (`/register`) — 10 alanlık form, alan bazlı doğrulama mesajları.
3. **Personel Paneli** (`/panel`) — iki bölüm:
   - İzin talep formu: tür (DAILY/ANNUAL), başlangıç, bitiş, açıklama.
   - "Taleplerim" tablosu: durum renkli rozetlerle (PENDING sarı, APPROVED yeşil, REJECTED kırmızı). Üstte kalan yıllık izin bakiyesi gösterilir.
4. **Yönetici Paneli** (`/yonetici`) — bekleyen talepler tablosu (personel adı, departman, tür, tarih aralığı, gün sayısı, açıklama) + her satırda Onayla / Reddet butonları. İşlem sonrası liste yenilenir.

### Frontend teknik notları

- React Router ile korumalı rotalar: token yoksa `/login`'e yönlendir; EMPLOYEE `/yonetici`'ye giremez.
- JWT localStorage yerine memory + gerekiyorsa localStorage'da tutulabilir (basitlik öncelik; bu bir demo task).
- API adresi `VITE_API_URL` ortam değişkeninden okunur.
- Arayüz dili tamamen **Türkçe**. Sade ve temiz bir görünüm yeterli; ağır UI kütüphanesi kurma (istenirse sadece hafif CSS veya Tailwind).
- **i18n zorunlu, gömülü statik metin yok:** Bileşenlerde JSX içine doğrudan Türkçe string yazılmaz. `react-i18next` (veya benzeri hafif bir i18n kütüphanesi) kullanılır, tüm metinler `frontend/src/locales/tr.json` gibi **tek bir Türkçe dil dosyasında** tutulur ve `t('anahtar')` ile çağrılır. Başka bir dil dosyası eklenmeyecek (çok dilli destek şu an gerekmiyor, sadece metinlerin koddan ayrıştırılması amaçlanıyor).
- **Playwright ile uçtan uca test:** Frontend'de geliştirilen her akış (login, kayıt, izin talebi oluşturma, onay/red) Playwright ile test edilecek. `frontend` içinde `@playwright/test` kurulur, testler `frontend/e2e/` altında tutulur.

## Ortam Değişkenleri

`backend/.env` (örneği `backend/.env.example` olarak da oluştur, **gerçek değerleri .env.example'a yazma**):

```env
DATABASE_URL=<Neon connection string>
JWT_SECRET=<rastgele uzun bir anahtar>
JWT_EXPIRES=1d
PORT=3000
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### TypeORM bağlantı notu

- `type: 'postgres'`, `url: DATABASE_URL`, `ssl: { rejectUnauthorized: false }` (Neon SSL zorunlu).
- `synchronize: true` kullanılabilir (demo proje), koda "prod'da migration kullanılır" yorumu ekle.
- `autoLoadEntities: true`.

## Kurallar ve Kısıtlar

- **`.env` dosyası asla commit edilmez** — `.gitignore`'a en baştan ekle. Connection string ve JWT secret yalnızca `.env`'de durur.
- Tüm DTO'larda `class-validator` doğrulaması olacak (ör. `@IsEmail`, `@Length(11, 11)` nationalId için, `@IsDateString`).
- Hata mesajları kullanıcıya Türkçe dönmeli.
- Kod yorumları anlaşılır olsun; **entity/DTO alan adları ve enum üyeleri İngilizce olacak** (ör. `firstName`, `nationalId`, `role: EMPLOYEE | MANAGER`). Sadece kullanıcıya gösterilen metinler (UI, hata mesajları) Türkçe kalır.
- Gereksiz bağımlılık ekleme; liste dışında büyük kütüphane kurulmayacak (i18n için `react-i18next`+`i18next`, test için `@playwright/test` bu kuralın istisnasıdır).
- Her iki proje için de `README.md` yaz: kurulum adımları, ortam değişkenleri, demo yönetici bilgileri, API listesi.
- Kod parça parça değil çalışır bütün halinde teslim edilecek; backend `npm run start:dev`, frontend `npm run dev` ile hatasız ayağa kalkmalı.
- **Bu proje bir iş başvurusu için hazırlanıyor.** Git commit'lerinde ve GitHub üzerinde Claude/AI hiçbir şekilde yazar veya katkıda bulunan (contributor) olarak görünmeyecek: commit mesajlarına `Co-Authored-By: Claude` veya benzeri bir satır **asla** eklenmeyecek, commit author/committer bilgisi her zaman kullanıcının kendi git kimliği (mevcut `user.name`/`user.email`) olacak.

## Mevcut Durum

Backend iskeletinin bir kısmı hazır olabilir (app.module.ts, user.entity.ts, leave-request.entity.ts, modül/controller/service dosyaları CLI ile üretilmiş durumda). Var olan dosyaları kontrol et; varsa üzerine inşa et, yoksa bu talimatlara göre sıfırdan oluştur.

## Yapılacaklar Sırası

1. Backend: auth modülü (register DTO, login, JWT strateji, guard'lar, seed yönetici)
2. Backend: leaves modülü (CRUD, onay/red, iş kuralları, transaction)
3. Backend: uç noktaları elle test et (curl/REST client), hataları düzelt
4. Frontend: Vite + React projesi, sayfa yapısı, API katmanı
5. Frontend: login/kayıt → personel paneli → yönetici paneli
6. README dosyaları ve `.env.example` dosyaları
7. (Deploy adımları manuel yapılacak: Render + Vercel — README'ye talimat yaz)
