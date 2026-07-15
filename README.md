# İşletme Yönetim Paneli

Telefoncu, bilgisayarcı, aksesuarcı ve teknik servisler için servis, satış, stok, kasa, alacak, al-sat ve işletme yönetimi uygulaması.

## İlk Çalıştırma

1. Node.js 20 veya daha yeni bir sürüm kurun.
2. Bu klasörde `npm start` çalıştırın.
3. Tarayıcıdan `http://127.0.0.1:8787` adresini açın.
4. İlk açılışta `/setup` mantığı otomatik çalışır ve ilk `OWNER` hesabını oluşturur.

Windows'ta `Telefoncu-Panelini-Baslat.bat` dosyasına çift tıklayarak paneli açabilirsiniz.

Kurulum tamamlandıktan sonra kurulum ekranı yeniden açılamaz. Giriş ekranında örnek kullanıcı, demo şifre veya parola ipucu gösterilmez.

`OWNER` hesabı sistem sahibidir; silinemez, pasifleştirilemez veya rolü düşürülemez. OWNER; ADMIN, MANAGER, STAFF, CASHIER ve TECHNICIAN hesapları oluşturabilir ve ayrıntılı izinlerini yönetebilir.

## Kullanıcı Yönetimi

- `OWNER` ve `ADMIN` hesapları Kullanıcılar ekranında personel hesaplarını görür.
- Yönetici; ad soyad, kullanıcı adı, e-posta ve telefon bilgisini değiştirebilir.
- Yönetici; rol ve ayrıntılı izinleri değiştirebilir, şifreyi yenileyebilir, hesabı askıya alabilir veya askıdan çıkarabilir.
- `OWNER` ve `ADMIN`, OWNER dışındaki ve kendi hesapları olmayan kullanıcıları silebilir.
- `STAFF`, `MANAGER`, `CASHIER` ve `TECHNICIAN` hesaplarında Kullanıcılar menüsü gösterilmez. Bu kullanıcılar yalnızca Hesabım ekranındaki kendi bilgilerini yönetebilir.
- Bütün yönetim kontrolleri yalnızca arayüzde değil, `/api/users` sunucu uçlarında da rol kontrolüyle korunur.
- Şifre değiştirme, askıya alma ve silme işleminde hedef kullanıcının açık oturumları kapatılır.

## Güvenlik

- Şifreler sunucuda Node.js `scrypt` ile tuzlanarak hashlenir.
- Oturum çerezi `httpOnly` ve `sameSite=Strict` olarak oluşturulur.
- Production ortamında çerez `secure` olur.
- Beş hatalı girişten sonra hesap 10 dakika kilitlenir.
- Giriş, hatalı giriş, şifre değişikliği ve önemli işletme hareketleri işlem geçmişine kaydedilir.
- Kullanıcı adı ve e-posta benzersizdir.

`SESSION_SECRET` için uzun ve rastgele bir değer kullanın. HTTPS arkasında çalıştırırken `NODE_ENV=production` ayarlayın.

## Veri ve Yedek

Sunucu kullanıcı, güvenlik ve işletme verilerini varsayılan olarak `data/database.json` içinde tutar. `DATA_DIR` environment variable tanımlanırsa veritabanı bu kalıcı klasörde saklanır; Render persistent disk kullanırken mount yolunu `DATA_DIR` olarak vermek gerekir. Tarayıcıda ayrıca çevrimdışı çalışma kopyası bulunur. Giriş yapılınca en güncel sunucu verisi alınır; servis, stok, kasa ve diğer değişiklikler sunucuya senkronlanır.

Ayarlar bölümünden tüm veriler JSON veya Excel uyumlu CSV olarak dışa aktarılabilir. Büyük kurulumlarda aynı API katmanı PostgreSQL gibi yönetilen bir veritabanına taşınabilir.

## API Olmadan Çalışma

- Piyasa fiyatı API’si yoksa manuel fiyat kaydı çalışır.
- Kur API’si yoksa manuel Dolar, Euro ve altın kuru girilebilir.
- OCR anahtarı yoksa fotoğraf yükleme, kontrol ve manuel aktarma ekranı çalışır.
- Son kayıtlı kurlar ve fiyatlar bağlantı olmasa da gösterilir.

## Modüller

Servis ve müşteri takibi, randevu takvimi, müşteriye özel servis takip bağlantısı, WhatsApp mesajları, stok ve barkod, satış, al-sat kâr/zarar, kasa ve gün sonu, alacak, tedarikçi borçları, şubeler, garanti, personel performansı, ayrıntılı kullanıcı izinleri, işlem geçmişi, yedekleme, canlı/manüel kur, yardım kutusu ve Basit Mod.

Al-sat kayıtları satın alınan ve satılan müşteriye bağlanır; cihaz alımında kasa çıkışı, satışında kasa girişi ve satış fişi oluşur. Alım/satış sözleşmesi, fotoğraf, PDF ve kullanıcının kendi kanıt videosu 5 MB sınırıyla kaydedilebilir ve indirilebilir.

Finans ve Sermaye ekranı aylık giderleri gün sayısına böler, günlük/haftalık/tek seferlik giderleri net kâra yansıtır, kâra geçme noktasını hesaplar ve Ana Kasa, Nakit Kasa, Kart Pos, Banka, Döviz Kasa ve Altın Kasa hesaplarını ayrı izler.

## Kontrol

```powershell
npm run check
```

Bu komut sunucu ve arayüz JavaScript dosyalarının sözdizimini kontrol eder.

## Prisma / PostgreSQL Geçişi

`prisma/schema.prisma` dosyası kullanıcı, tercih, yetki, cihaz kataloğu, servis, al-sat, randevu, tedarikçi, garanti, kur ve işlem geçmişi modellerini içerir. PostgreSQL dağıtımında `DATABASE_URL` tanımlanıp Prisma paketleri kurularak migration üretilebilir. Ek paket gerektirmeyen yerleşik JSON veri katmanı varsayılan olarak çalışmaya devam eder.

## Türkçe Kullanıcı Görevleri

Kullanıcı eklerken görevler ekranda İşletme Sahibi, Yönetici, Müdür, Personel, Kasiyer ve Teknisyen olarak görünür. Güvenli veri bağlantıları için içerideki sabit rol kodları değişmez.

## API Bağlantıları

`OPENAI_API_KEY` tanımlanırsa Fotoğraftan Doldur özelliği resmi OpenAI Responses API üzerinden cihaz bilgilerini okumayı dener. Anahtar hiçbir zaman tarayıcıya gönderilmez. Dolar ve Euro, API anahtarı gerektirmeden TCMB günlük kur verisinden alınır. `EXCHANGE_RATE_API_URL` tanımlanırsa özel kur servisi TCMB yerine kullanılır. Kur servisi çalışmazsa manuel kayıt ve son kaydedilmiş değerler korunur.

## Telefona ve Bilgisayara Kurulum

Uygulama PWA desteğine sahiptir. HTTPS üzerinden yayınlandıktan sonra Android ve masaüstü Chrome/Edge üzerinde `Uygulamayı yükle`, iPhone Safari üzerinde Paylaş menüsündeki `Ana Ekrana Ekle` seçeneği kullanılabilir.

## İnternete Yayınlama

`Dockerfile` ve ücretsiz Render yapılandırması içeren `render.yaml` hazırdır. Render hesabında bu proje bir Git deposu üzerinden Blueprint olarak bağlanabilir.

Canlı ortamda en az `SESSION_SECRET` ayarlanmalıdır. Fotoğraf okuma için `OPENAI_API_KEY`, canlı kur için `EXCHANGE_RATE_API_URL` eklenebilir.

Önemli: Render ücretsiz web hizmetinde kalıcı disk bulunmaz. Ücretsiz deneme ve ilk kullanım için uygundur; hizmet yeniden oluşturulursa sunucudaki kayıtlar sıfırlanabilir. Gerçek işletme kullanımında Render kalıcı diskli planı veya yönetilen kalıcı veritabanı kullanılmalı ve Ayarlar bölümünden düzenli JSON yedeği alınmalıdır.
