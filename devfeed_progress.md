# DevFeed Progress

## Tamamlanan Işlar

### Backend (server/)
- ✅ POST `/auth/register` — qeydiyyat, token qaytarır
- ✅ POST `/auth/login` — daxil olma, token qaytarır
- ✅ GET `/profile` — istifadəçi profili, computed stack
- ✅ PATCH `/profile` — profil güncəllə (role-subrole format: "developer-fullstack")
- ✅ PostgreSQL schema: users table (id, name, email, password_hash, bio, role, skills[], languages[], website, created_at)

### Frontend (src/)
- ✅ RegisterScreen — name/email/password
- ✅ LoginScreen — email/password + tab keçişi
- ✅ RegisterOnboarding — 5 step (step 2 skip ola biləcək)
  - Step 0: Ad, soyad, bio
  - Step 1: Rol seçimi (8 variant)
  - Step 2: Sub-rol seçimi (developer → 6 variant, designer → 5, devops → 4, data → 4, hr → 3, manager → 3, student → 3, founder → 3)
  - Step 3: Texnologiya + dil seçimi (chip-ləri)
  - Step 4: Preview (role-subrole: "Developer — Full Stack" formatında)
- ✅ ProfileScreen — profil göstərişi
  - Rol: "Developer — Full Stack"
  - Bio
  - Texnologiyalar & Bacarıqlar: Sub-role əsasında TECH_STACKS-dən (frontend → React, Vue, vs.)
  - Dillər
- ✅ AuthContext — signUp, signIn, completeOnboarding
- ✅ API client (axios) — setToken(), updateProfile(), fetchProfile()
- ✅ Navigation — Login/Register → RegisterOnboarding → Main (Feed, Messages, Profile, Settings)

### Data Structures (Plan əsasında)
- ✅ ROLES (8 təsnif): developer, designer, devops, hr, manager, student, founder, data
- ✅ SUB_ROLES: Hər rola uyğun alt rollar
- ✅ TECH_STACKS: Sub-role əsasında texnologiya (40+ kombinasyon)

## Hazırda Qalıq

### 1. Onboarding Tamamlama
- [x] Step 3-dən seçilən texnologiyaları Preview-də göstər
- [x] "Əlavə bacarıqlar (vergül ilə)" text input → yalnız preview üçün (chip seçimi daha əhəmiyyətlidir)

### 2. FeedScreen & Post Göstərişi
- [ ] GitHub commit göstərişi (GitCard)
- [ ] Deploy status göstərişi (DeployCard)
- [ ] Media (video/foto) göstərişi
- [ ] Job announcement göstərişi
- [ ] Like, comment, bookmark işləri
- [ ] User profile kartı (avatar, name, role)

### 3. Profile Screen Tamamlama
- [ ] Profili düzənlə düyməsi — EditProfileScreen-ə keç
- [ ] Bio, website düzənlə
- [ ] Skills/languages düzənlə
- [ ] User posts sayı göstər

### 4. Messages Screen
- [ ] Sohbət siyahısı
- [ ] Sohbət detayı
- [ ] Mesaj göndər
- [ ] Read/unread status

### 5. Settings Screen
- [ ] Tema dəyişir (dark/light)
- [ ] Notifications
- [ ] Privacy settings
- [ ] Logout

---

## DevFeed.jsx Plan (Web Versiyası)

### Struktur:
1. **Header** — Logo, search, notifications, profile
2. **Sidebar** — Navigation (Feed, Explore, Messages, Profile, Settings)
3. **Main Feed** — Post kartları
   - GIT posts (GitHub commit)
   - DEPLOY posts (production deploy status)
   - MEDIA posts (video, foto)
   - JOB posts (job announcement)
4. **Post Card** — Hər post üçün:
   - User avatar + name + role + time
   - Post type badge (GIT, DEPLOY, MEDIA, JOB)
   - Post content (text, code, video, job details)
   - Engagement (likes, comments, bookmarks)
5. **Right Sidebar** — Trending tags, suggested users
6. **Modals/Pages** — Login, Register, Profile, Messages, Settings

### Tech:
- React (Hooks)
- Lucide React icons
- Dark theme (#020617, #161b22, #0d1117)
- CSS Grid/Flex

---

## Sonradan Əlavə Ediləcəklər (Backlog)

### Auth & Profile
- [ ] GitHub OAuth
- [ ] Google OAuth
- [ ] Email verification
- [ ] 2FA

### Content
- [ ] Post yaratma (GIT, DEPLOY, MEDIA, JOB)
- [ ] Draft saxlama
- [ ] Schedule post (sonra paylaşma)
- [ ] Media upload (video, foto)

### Discovery
- [ ] Trending posts, tags
- [ ] Recommended users
- [ ] Search (posts, users, tags)
- [ ] Filters (by role, tech, date)

### Engagement
- [ ] Real-time notifications (push)
- [ ] Real-time messages (WebSocket)
- [ ] Like/comment animations
- [ ] Repost, share

### Profile Features
- [ ] Portfolio projects göstərişi
- [ ] GitHub stats (contributions graph)
- [ ] Experience timeline
- [ ] Endorsements (skill validation)
- [ ] Following/Followers

### Analytics
- [ ] Post views, engagement metrics
- [ ] Profile views
- [ ] Dashboard

### Moderations
- [ ] Report post/user
- [ ] Block user
- [ ] Content moderation


### Moderasiya və Məzmun Siyasəti (ətraflı)

- [ ] Avtomatlaşdırılmış moderasiya boru xətti qurmaq (NSFW, zorakılıq, nifrət, cinsi məzmun) — üçüncü tərəf API-ləri və daxili qaydalarla
- [ ] Mətn üçün filtrlər: söyüş, təhqir, nifrət nitqi, hədələr (konfiqurlanabilən siyahılar + ML modelləri)
- [ ] Şəkil/Video siyasətləri: maksimum fayl ölçüsü, icazə verilən formatlar, video uzunluğu məhdudiyyəti, avtomatik transcoding, thumbnail və önizləmə yaradılması
- [ ] İstifadəçi üzrə yükləmə məhdudiyyətləri və kvotalar (gündəlik/aylıq) və fayl başına limitlər
- [ ] Yüklənən fayllar üçün virus və zərərli proqram skaneri (ClamAV və ya bulud xidməti)
- [ ] Spam və bot aşkarlanması (rate-limitlər, davranış əsaslı siqnallar, şübhəli axınlarda CAPTCHA)
- [ ] Şikayət axını: istifadəçi şikayəti endpointi, şikayət metadataları, ciddilik tag-ları, avtomatik eskalasiya qaydaları
- [ ] Moderator yoxlama sırası (UI + API) — prioritet, təyin etmə və toplu əməliyyatlar (sil, xəbərdarlıq, qadağa)
- [ ] İtiraz (appeal) prosesi, audit logları və əməliyyat tarixçəsi üçün şəffaflıq
- [ ] 18+ məzmun üçün age-gating və etikətləndirmə; lazım olduqda valideyn icazəsi axını
- [ ] DM/Qrup moderasiyası: səssizə alma, mesajları silmək, üzvləri qovmaq/qadağan etmək, dəvət məhdudiyyətləri
- [ ] Üçüncü tərəf xidmətlərin inteqrasiyası: Google Vision SafeSearch, Perspective API, AWS Rekognition (konfiqurlanabilən)
- [ ] Moderasiya hadisələri üçün loglama və saxlanma siyasətləri (DSAR/GDPR tələblərini dəstəkləyəcək şəkildə)


### Yükləmələr: şəkillər, videolar, profil şəkilləri

- [ ] İcazə verilən formatlar və maksimum ölçüləri müəyyən etmək (şəkillər: JPG/PNG/WebP maksimum X MB; videolar: MP4 maksimum Y MB və Z saniyə)
- [ ] Server tərəfdə transcoding/resizing (FFmpeg) və thumbnail yaradılması tətbiq etmək
- [ ] Orijinallar və törəmə faylları S3/CDN kimi saxlama ilə lifecycle qaydaları ilə saxlamaq; giriş üçün imzalanmış URL-lər əlavə etmək
- [ ] Profil foto və cover üçün ölçü/aspect ratio tövsiyələrini tətbiq etmək
- [ ] Client tərəfdə validasiya, upload progress və dayandırılıb davam etdirilə bilən yükləmələr (tus və ya multipart) təmin etmək


### Hüquq və Uyğunluq

- [ ] DMCA takedown prosesi və siyasət səhifəsi
- [ ] Məxfilik Siyasəti və Xidmət Şərtləri layihələri (məlumat istifadəsi, cookie-lər, üçüncü tərəf xidmətlər daxil olmaqla)
- [ ] GDPR/CCPA uyğunluğu: istifadəçi sorğuları üçün endpointlər (məlumat ixracı, silinmə), data minimallaşdırma, hüquqi əsaslandırma
- [ ] Mesajlar, yükləmələr və loglar üçün məlumat saxlama siyasəti; konfiqurasiya edilə bilən saxlama müddətləri
- [ ] Moderasiya və admin əməliyyatları üçün audit loglarının saxlanması
- [ ] Hüquq-mühafizə orqanları üçün tələblər və xəbərdarlıqlar üçün iş axınlarının hazırlanması (hüquqi baxışla)
- [ ] Ödəniş/İanə uyğunluğu: birbaşa ödəniş işlədiləcəksə PCI tələbləri; məsləhət: Stripe kimi üçüncü tərəf istifadə etmək


---

## Mərhələ (Next Steps)

1. **FeedScreen mobilə (Əsas prioritet)**
   - [x] Post göstərişi (GIT, DEPLOY, MEDIA, JOB kartları)
   - [x] Like, comment, bookmark
   - [x] User profile kartı

2. **MessagesScreen**
   - Sohbət siyahısı
   - Real-time messaging (optional, sonra)

3. **SettingsScreen**
   - Tema, logout, privacy

4. **Web versiyası (DevFeed.jsx)**
   - HTML/CSS/React-ə çevir
   - Sidebar navigation
   - Post feed layout

5. **Real-time (Socket.io)**
   - Messages
   - Notifications
   - Activity feed

---

## İş Elanı Promosyonu üçün IBAN Ödəniş Sistemi

- [ ] Promosyon ödəniş səhifəsi: istifadəçi iş elanını qabağa çəkmək üçün məbləği seçir və IBAN məlumatlarını göstərir
- [ ] Admin/İşəgötürən rəhbəri üçün IBAN nömrəsi qeydiyyatı və təsdiqi funksiyası
- [ ] Ödəniş statusu: "Gözləyir", "Təsdiq edildi", "Rədd edildi" üçün backend prosesləri
- [ ] Ödəniş bildirişləri: ödəniş qəbul olunduqdan sonra iş elanının prioritetini artırmaq və ya ön plana çıxarmaq
- [ ] Ödəniş məlumatlarının təhlükəsizliyi: IBAN və istifadəçi maliyyə məlumatları serverdə qorunmalı, yalnız lazım olduqda əlçatan olmalıdır
- [ ] Bank köçürməsi üçün qaydalar: ödəniş təsdiqini manual/avtomatlaşdırılmış yoxlama mexanizmi (bank çıxarışına əsaslanaraq)
- [ ] İş elanının promosiya müddəti və status xəritəsi (məsələn: 7 gün, 14 gün, 30 gün ön plana çıxarılması)

