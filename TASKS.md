# DevFeed Tapşırıqları

## Hazırlananlar
- [x] Backenddə bir-ə-bir söhbət üçün `GET /conversations/:id` endpointi əlavə edildi.
- [x] Backenddə `POST /conversations/:id/messages` endpointi əlavə edildi.
- [x] Backenddə `POST /conversations` endpointi əlavə edilərək yeni söhbət yaradıldı.
- [x] `ConversationDetailScreen` frontend ekranı əlavə edildi.
- [x] `MessagesScreen`-dən söhbətə keçid əlavə edildi.
- [x] `NewConversationScreen` frontend ekranı əlavə edildi.
- [x] `src/api/index.js` üzərində `createConversation`, `fetchConversation`, və `sendMessage` funksiyaları əlavə edildi.
- [x] Root səviyyəsində yaradılmış generasiya edilmiş log və debug faylları silindi.

## Tamamlanmalı tapşırıqlar
- [ ] `MessagesScreen`-də yeni söhbət yaradıldıqdan sonra listi avtomatik yeniləyən state və ya refetch mexanizmi əlavə et.
- [ ] `NewConversationScreen`-də email yoxlaması və istifadəçiyə daha dəqiq səhv mesajları göstər.
- [ ] `ConversationDetailScreen`-də mesaj göndərildikdən sonra inputu sıfırlamaq və mesaj siyahısına avtomatik scroll etmək.
- [ ] `MessagesScreen`-də boş siyahı vəziyyətində daha uyğun UX təqdim etmək.
- [ ] Profil əsasında və ya istifadəçi axtarışı ilə yeni söhbət yaratma funksiyası əlavə etmək.
- [ ] Backenddə qrup söhbətləri üçün model və route hazırlamaq (conversation növü, participants, qrup mesajları).
- [ ] Backend və frontend arasında real-time və ya polling ilə mesaj yenilənməsini hazırlamaq.
- [ ] Backenddə istifadəçi profil və mesaj bildirişləri üçün notification modelini planlaşdırmaq.
- [ ] `DevFeed.jsx`-dəki plan üzrə gələcək UI/UX və mövcud app arasında uyğunlaşmanı sənədləşdirmək.

## Gələcək mərhələlər
- [ ] İstifadəçi qeydiyyatında `role`, `skills`, `languages` sahələrini real frontend forması ilə doldurmaq.
- [ ] Profillərdə istifadəçi bio, biliklər və posts sayını backenddən dinamik gətirmək.
- [ ] Mesajlaşmanı qrup söhbəti, qrup bildirişləri və admin/moderasiya ilə genişləndirmək.
- [ ] Marketplace / Explore / Search ekranları üçün backend axtarış endpointləri hazırlamaq.
- [ ] Bildirişlər, axtarış, suggestions və moderasiya funksiyalarını mərhələli şəkildə tətbiq etmək.

## Qeyd
- Bu fayl sənin və mənim üçün işin vəziyyətini izləmək, növbəti mərhələləri unutmamaq və bitirdikcə dəyişiklikləri qısa zamanda qeyd etmək üçündür.
