# Firebase Auth Android Uygulamasi

Firebase Authentication kullanarak kullanici kayit ve giris islemi yapan Android uygulamasi (Java).

## Ozellikler

- **Kullanici Kaydi (Register):** E-posta ve sifre ile yeni hesap olusturma
- **Kullanici Girisi (Login):** Mevcut hesapla giris yapma
- **Ana Sayfa:** Kullanici bilgilerini goruntuleme (e-posta, UID)
- **Cikis Yapma (Logout):** Oturumu kapatma
- **Otomatik Giris:** Daha once giris yapan kullanici otomatik yonlendirilir
- **Form Dogrulama:** E-posta ve sifre alanlari icin dogrulama kontrolleri

## Kurulum

### 1. Firebase Projesi Olusturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Proje Ekle" (Add Project) butonuna tiklayin
3. Proje adini girin ve olusturun

### 2. Android Uygulamasini Firebase'e Ekleme

1. Firebase Console'da projenize gidin
2. Android ikonuna tiklayin
3. Paket adi olarak `com.example.firebaseauthapp` girin
4. "Uygulamayi Kaydet" butonuna tiklayin
5. `google-services.json` dosyasini indirin

### 3. google-services.json Dosyasini Degistirme

Indirdiginiz `google-services.json` dosyasini `FirebaseAuthApp/app/` klasorune kopyalayin.
Mevcut placeholder dosyasinin uzerine yazin.

### 4. Authentication'i Etkinlestirme

1. Firebase Console > Authentication > Sign-in method
2. "E-posta/Sifre" (Email/Password) secenegini etkinlestirin

### 5. Projeyi Acma ve Calistirma

1. Android Studio'da "Open an Existing Project" secin
2. `FirebaseAuthApp` klasorunu secin
3. Gradle senkronizasyonunu bekleyin
4. Uygulamayi calistirin

## Proje Yapisi

```
FirebaseAuthApp/
├── app/
│   ├── src/main/
│   │   ├── java/com/example/firebaseauthapp/
│   │   │   ├── LoginActivity.java        # Giris ekrani
│   │   │   ├── RegisterActivity.java     # Kayit ekrani
│   │   │   └── MainActivity.java         # Ana sayfa
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   ├── activity_login.xml    # Giris ekrani tasarimi
│   │   │   │   ├── activity_register.xml # Kayit ekrani tasarimi
│   │   │   │   └── activity_main.xml     # Ana sayfa tasarimi
│   │   │   └── values/
│   │   │       ├── colors.xml
│   │   │       ├── strings.xml
│   │   │       └── themes.xml
│   │   └── AndroidManifest.xml
│   ├── build.gradle                       # Uygulama seviyesi Gradle
│   └── google-services.json              # Firebase yapilandirma dosyasi
├── build.gradle                           # Proje seviyesi Gradle
├── settings.gradle
└── gradle.properties
```

## Gereksinimler

- Android Studio Arctic Fox veya daha yenisi
- Android SDK 24+ (Android 7.0)
- Java 8+
- Firebase hesabi

## Teknolojiler

- **Firebase Authentication** - Kullanici kimlik dogrulama
- **Material Design Components** - Modern UI bilesenler
- **ConstraintLayout** - Esnek ekran tasarimi
- **CardView** - Kart gorunumu

## Ekran Goruntuleri

Uygulama 3 ana ekrandan olusur:

1. **Giris Ekrani** - E-posta ve sifre ile giris
2. **Kayit Ekrani** - Yeni hesap olusturma (sifre onaylama ile)
3. **Ana Sayfa** - Kullanici bilgileri ve cikis butonu
