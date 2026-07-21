# İK İzin Yönetim Sistemi — Backend

NestJS + TypeORM + PostgreSQL (Neon.tech) ile geliştirilmiş izin yönetim sistemi API'si.

## Kurulum

```bash
npm install
```

`.env.example` dosyasını `.env` olarak kopyalayın ve gerçek değerleri girin:

```bash
cp .env.example .env
```

### Ortam Değişkenleri

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (`?sslmode=require` içermeli) |
| `JWT_SECRET` | JWT imzalama anahtarı, rastgele ve uzun bir string olmalı |
| `JWT_EXPIRES` | Token geçerlilik süresi (ör. `1d`) |
| `PORT` | Sunucunun çalışacağı port (varsayılan `3000`) |

## Çalıştırma

```bash
npm run dev
```

Kod değişikliklerinde otomatik yeniden başlatma (watch mode) isteniyorsa: `npm run start:dev`.

Sunucu `http://localhost:3000` adresinde ayağa kalkar. `TypeOrmModule` `synchronize: true` ile yapılandırıldığı için (demo proje — prod'da migration kullanılmalıdır) tablolar ilk açılışta otomatik oluşturulur.

## Demo Yönetici Hesabı

Uygulama ilk açılışta, yoksa otomatik olarak bir yönetici hesabı oluşturur:

- **E-posta:** `admin@sirket.com`
- **Şifre:** `Admin123!`

## Demo Personel Hesapları

Uygulama ilk açılışta 3 demo personel (EMPLOYEE) hesabı da oluşturur, hepsinin şifresi `Personel123!`. Örnek:

- **E-posta:** `ayse.yilmaz@sirket.com`
- **Şifre:** `Personel123!`

## API Uç Noktaları

| Metot | Yol | Erişim | Açıklama |
|---|---|---|---|
| GET | `/health` | Herkese açık | Sağlık kontrolü (DB bağlantısını da doğrular) |
| POST | `/auth/register` | Herkese açık | 10 alanlık kayıt formu |
| POST | `/auth/login` | Herkese açık | email + şifre → JWT döner |
| GET | `/auth/me` | JWT | Giriş yapan kullanıcının bilgileri |
| POST | `/leaves` | JWT (EMPLOYEE + MANAGER) | Yeni izin talebi oluştur |
| GET | `/leaves/my` | JWT | Kullanıcının kendi talepleri (tüm statüler) |
| PATCH | `/leaves/:id` | JWT (sahibi) | Bekleyen talebi düzenle |
| DELETE | `/leaves/:id` | JWT (sahibi) | Bekleyen talebi sil |
| GET | `/leaves/pending` | JWT + MANAGER | Bekleyen tüm talepler |
| GET | `/leaves/history` | JWT | Kendi geçmişi; MANAGER `?scope=all` ile herkesinkini görür |
| PATCH | `/leaves/:id/approve` | JWT + MANAGER | Talebi onayla |
| PATCH | `/leaves/:id/reject` | JWT + MANAGER | Talebi reddet |
| PATCH | `/leaves/:id/cancel` | JWT + MANAGER | Onaylanmış izni iptal et |
| GET | `/users` | JWT + MANAGER | Tüm kullanıcıları listele |
| PATCH | `/users/me` | JWT | Kendi profilini güncelle |
| PATCH | `/users/me/password` | JWT | Kendi şifresini değiştir |
| PATCH | `/users/:id` | JWT + MANAGER | Kullanıcının rolünü/bakiyesini düzenle |
| POST | `/users/:id/reset-password` | JWT + MANAGER | Kullanıcının şifresini sıfırla |
| POST | `/users/:id/reset-balance` | JWT + MANAGER | Yıllık izin bakiyesini sıfırla |
| POST | `/users/:id/activate` \| `/deactivate` | JWT + MANAGER | Hesabı aktif/pasif yap |

## WebSocket (Anlık Bildirimler)

Socket.io tabanlı bir gateway (`/`) JWT ile kimlik doğrulaması yapar. Bağlantı sırasında `auth: { token }` ile JWT gönderilir.

- Personel yeni izin talebi oluşturduğunda tüm MANAGER'lara `leave.created` event'i yayınlanır (yeni talep verisiyle).
- Yönetici bir talebi onayladığında/reddettiğinde ilgili personele `leave.updated` event'i yayınlanır (güncel talep verisiyle).

## İş Kuralları

- Yıllık izin onaylandığında bakiyeden düşülür (transaction içinde).
- Yıllık izin talebinde bakiye yetersizse 400 hatası döner.
- Bitiş tarihi başlangıçtan önce olamaz; geçmiş tarihe talep girilemez.
- Aynı kullanıcının çakışan (PENDING/APPROVED) talebi varsa yeni talep reddedilir.
- Sadece PENDING durumundaki talepler onaylanabilir/reddedilebilir.
- Onay/red uç noktaları sadece MANAGER rolüne açıktır.

## Test

```bash
npm run test       # unit testler (jest)
npm run test:e2e   # NestJS e2e testleri
```

Ana uç noktalar ve iş kuralları (bakiye düşme, çakışma, yetki senaryoları) ayrıca frontend'deki Playwright e2e testleriyle uçtan uca doğrulanmıştır (bkz. `frontend/README.md`).

## Deploy (Render.com)

1. [Render.com](https://render.com)'da yeni bir **Web Service** oluşturun, bu repodaki `backend/` klasörünü root directory olarak seçin.
2. Build komutu: `npm install && npm run build`
3. Start komutu: `npm run start:prod`
4. Environment sekmesinden `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES`, `PORT` değişkenlerini `.env` dosyasındaki gerçek değerlerle girin.
5. Deploy sonrası verilen URL'yi frontend'in `VITE_API_URL` değişkenine yazın.
6. Render'ın ücretsiz planı belirli bir süre istek gelmezse servisi uykuya alır. Repo, `/health` uç noktasını 10 dakikada bir çağıran bir GitHub Actions cron job'u içerir (`.github/workflows/keep-alive.yml`) — servisi uyanık tutmak için otomatik çalışır.
