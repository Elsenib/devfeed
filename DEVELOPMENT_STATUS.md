## DevFeed — Geliştirme Durumu ve Sonraki Adımlar

Kısa ve net: aşağıda yapılanlar, şu anki eksikler ve öncelikli adımlar listelenmiştir.

### Yapılanlar (benim tarafımdan)
- Lokal `metro.config.js` regex hatası düzeltildi.
- `android/gradle.properties` içinde NDK/CMake ve suppress uyarısı eklendi.
- Lokal `gradlew assembleRelease` ile release APK oluşturuldu ve cihazınıza `adb install -r` ile yüklendi.
- Uygulama paket adı `com.devfeedmobile` ile başlatıldı; cihazda açıldı.
- Client konfigürasyonu `src/constants/config.js` içindeki `API_BASE_URL` kontrol edildi (prod Railway URL).
- Backend `/health` endpoint'i kontrol edildi — üretim backend yanıt veriyor.

### Gözlemler
- Uygulamadaki kayıt akışı artık basit görünüyor; daha önceki sürümdeki "rol/alan/diller/teknolojiler" seçimleri görünmüyor.
- Sunucuda şu an `users` tablosunda `role`/`skills`/`languages` alanları yok (database schema `server/index.js` üzerinden oluşturuluyor). Bu yüzden bu alanlar kaydedilmiyor.
- EAS bulut build denemesi proje arşivinin 2.7GB olmasından dolayı başarısız oldu — `.easignore` eklenmeli.

### Eksik / Kalan İşler (öncelik sırasına göre)
1. `users` tablosuna `role`, `skills`, `languages` gibi kolonlar ekle (migration veya `CREATE TABLE` güncellemesi).
2. `/auth/register` endpoint'ini body içinden bu yeni alanları kabul edecek şekilde güncelle.
3. `RegisterScreen.jsx`'e rol/alan/diller seçim UI öğeleri ekle ve API'ye gönder.
4. `Profile` ekranında bu bilgileri göster.
5. Ayarlar (settings) ekranını genişlet: paylaşım/mesajlaşma tercihlerinin kontrolü, gizlilik seçenekleri.
6. Test kullanıcıları ekle / seed script yaz: hızlıca developer/test hesapları oluşturmak için.
7. `.easignore` oluşturup gereksiz dosyaları dışla; sonra `npx eas build --platform android --profile release` yeniden dene.
8. Lokal backend çalıştır ve uygulamayı lokal backend'e yönlendirerek tam akışı test et (komutlar aşağıda).
9. Eğer runtime hata/eksik UI raporu gelirse, `adb logcat` topla ve incele.

### Hızlı Öncelikli Adımlar (ben yapabilirim)
- 1) Sunucuya hızlı migration ekleyip `role` ve `skills` kolonlarını yaratabilirim.
- 2) `RegisterScreen.jsx` üzerinde UI değişikliğini ekleyip test build çıkarabilirim (lokal veya EAS).
- 3) `.easignore` ekleyip EAS upload boyutunu küçültebilirim.

### Nasıl test edilir (kısa komutlar)
Backend (lokal çalıştırmak için):
```bash
cd server
npm install
npm run start
```

Uygulama (APK yüklü ise yeniden başlat):
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell monkey -p com.devfeedmobile -c android.intent.category.LAUNCHER 1
```

Log toplamak (hata varsa):
```bash
adb logcat -c
adb logcat | sed -n '1,200p'
```

EAS build için `.easignore` kısa örneği (workspace köküne ekle):
```
node_modules/
.git/
.expo/
eas-inspect/**
latest-eas-log*
*.br
*.gz
tmp/
```

### Son not
Dosya: `src/constants/config.js` şu an üretim backend'e işaret ediyor. Lokal test istiyorsanız bu değeri `http://10.0.2.2:4000` (emülatör) veya `http://<pc-ip>:4000` (gerçek cihaz) olarak değiştirin.

Eğer isterse, hemen 1) DB migration 2) `RegisterScreen` değişiklikleri 3) seed kullanıcı oluşturma adımlarını uygulamaya alırım. Hangisinden başlamamı istersin?
