# Bu Sürümde Yapılan Düzeltmeler

1. Personel hesaplarından **Kullanıcılar** menüsü kaldırıldı.
2. Kullanıcı listesi ve hesap talepleri sunucuda yalnızca `OWNER` ve `ADMIN` rollerine açık bırakıldı.
3. Yönetici ekranına **Hesabı Düzenle** işlemi eklendi:
   - Ad soyad
   - Kullanıcı adı
   - E-posta
   - Telefon
4. Yönetici şifre değiştirdiğinde kullanıcının açık oturumları kapatılıyor.
5. Hesap askıya alındığında kullanıcının açık oturumları kapatılıyor.
6. `OWNER` ve `ADMIN`, korumalı OWNER hesabı dışındaki kullanıcıları silebiliyor.
7. OWNER hesabı silinemez, askıya alınamaz ve başka bir kullanıcı tarafından değiştirilemez.
8. Doğrudan `/users`, `/dashboard` gibi adreslere gidildiğinde sunucu artık uygulama ana sayfasını açıyor; gereksiz **Not Found** hatası giderildi.
9. Eski tarayıcı önbelleğinin yeni kodu engellememesi için PWA önbellek sürümü ve dosya sürüm parametreleri yenilendi.

## Çalıştırılan Kontroller

- `npm install`
- `npm start`
- `npm run check`
- İlk OWNER kurulumu
- OWNER/ADMIN/STAFF girişleri
- Personelin kullanıcı listesinden engellenmesi
- Kullanıcı adı ve e-posta değiştirme
- Yönetici şifre değiştirme
- Askıya alma ve askıdan çıkarma
- Yönetici silme yetkisi
- OWNER hesabının korunması
- Doğrudan sayfa adresinde SPA açılması
