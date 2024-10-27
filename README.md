# Duygu Takip Uygulaması

Bu proje, kullanıcıların günlük duygu durumlarını, yediklerini ve aktivitelerini takip edebilecekleri bir mobil uygulama ve onun backend API'sini içerir.

## Proje Yapısı

Proje iki ana bölümden oluşmaktadır:

1. `api`: Go ile yazılmış backend API
2. `client`: React Native ve Expo ile geliştirilmiş mobil uygulama

### API (Backend)

API, Go programlama dili kullanılarak geliştirilmiştir ve Gin web framework'ü ile oluşturulmuştur. Veritabanı işlemleri için Prisma ORM kullanılmaktadır.

Önemli dosyalar ve klasörler:

- `api/main.go`: Ana uygulama giriş noktası
- `api/handlers/`: API endpoint işleyicileri
- `api/middleware/`: Kimlik doğrulama gibi ara katman işlevleri
- `api/prisma/`: Veritabanı şeması ve Prisma yapılandırması

### Client (Mobil Uygulama)

Mobil uygulama, React Native ve Expo kullanılarak TypeScript ile geliştirilmiştir.

Önemli dosyalar ve klasörler:

- `client/App.tsx`: Ana uygulama bileşeni
- `client/screens/`: Uygulama ekranları
- `client/components/`: Yeniden kullanılabilir UI bileşenleri
- `client/hooks/`: Özel React hooks'ları
- `client/context/`: React context'leri (örn. kimlik doğrulama)
- `client/services/`: API istekleri ve diğer servisler

## Özellikler

- Kullanıcı kaydı ve girişi
- Duygu durumu ekleme ve görüntüleme
- Yemek takibi
- Etiketleme sistemi
- Uygulama şifresi koruması

## Kurulum

### API (Backend)

1. Go'yu yükleyin (https://golang.org/)
2. Proje dizinine gidin: `cd api`
3. Bağımlılıkları yükleyin: `go mod tidy`
4. `.env` dosyasını oluşturun ve gerekli ortam değişkenlerini ayarlayın
5. Veritabanını migrate edin: `go run github.com/prisma/prisma-client-go db push`
6. API'yi çalıştırın: `go run main.go`

### Client (Mobil Uygulama)

1. Node.js ve npm'i yükleyin (https://nodejs.org/)
2. Expo CLI'yi yükleyin: `npm install -g expo-cli`
3. Proje dizinine gidin: `cd client`
4. Bağımlılıkları yükleyin: `npm install`
5. Uygulamayı başlatın: `npm start`

## Kullanım

Uygulamayı kullanmaya başlamak için:

1. Kayıt olun veya giriş yapın
2. Ana ekrandan duygu durumu ekleyin
3. Yemek ve aktivite takibi yapın
4. Geçmiş kayıtlarınızı görüntüleyin ve analiz edin

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: XYZ'`)
4. Dalınıza push yapın (`git push origin yeni-ozellik`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.