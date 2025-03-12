# Vite + React + TypeScript + Tailwind CSS v4 Projesi

Bu proje, modern web geliştirme araçlarını kullanarak oluşturulmuş bir başlangıç şablonudur.

## Kullanılan Teknolojiler

- **Vite** - Hızlı, modern bir frontend geliştirme aracı
- **React** - Kullanıcı arayüzü oluşturmak için JavaScript kütüphanesi
- **TypeScript** - JavaScript'e tip güvenliği ekleyen bir programlama dili
- **Tailwind CSS v4** - Utilite-first CSS framework
  - Yeni CSS değişkenlerine dayalı tema sistemi
  - Native CSS cascade layers desteği
  - Vite plugin entegrasyonu

## Kurulum

Projeyi yerel makinenizde çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

## Tailwind CSS v4 Değişiklikleri

- `@tailwind` direktifleri yerine `@import "tailwindcss"` kullanılıyor
- Gradyan, gölge, border özellikleri değiştirildi
- Özel Vite eklentisi kullanılıyor
- CSS değişkenleri ve tema sistemi daha gelişmiş
- Shadow, radius ve blur ölçekleri yeniden adlandırıldı

## Yapı

- `src/` - Kaynak kodları içerir
  - `assets/` - Resim ve diğer statik dosyalar
  - `components/` - React bileşenleri (gerektiğinde oluşturun)
  - `App.tsx` - Ana uygulama bileşeni
  - `main.tsx` - Uygulama giriş noktası
  - `index.css` - Tailwind CSS importu ve global stiller

## Derleme ve Dağıtım

Uygulamayı derlemek için:

```bash
npm run build
```

Derlenen dosyalar `dist/` klasöründe oluşturulacaktır.

## Debug ve Loglama

Uygulama, geliştirme sırasında debug ve loglama için yapılandırılmıştır:

- Bileşen seviyesinde hata ayıklama için React Developer Tools kullanılabilir
- Vite'ın hızlı hot module replacement (HMR) özelliği ile hızlı geliştirme
- Tailwind CSS v4 ile CSS değişkenlerini kullanarak stil debugging

## Lisans

MIT
