# UniGreen: Kapsamlı Karbon Ayak İzi ve Sürdürülebilirlik Analiz Sistemi 🌱

[![Deploy Status](https://img.shields.io/badge/Deploy-Render-success?style=flat-square&logo=render)](https://render.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Academic Project](https://img.shields.io/badge/Context-Academic_Research-blue?style=flat-square)](#)

## Proje Özeti (Abstract)
**UniGreen**, bireysel, kurumsal ve kampüs ölçeğindeki çevresel etkileri ölçmek, karbon emisyonlarını analiz etmek ve sürdürülebilirlik hedeflerini (Paris İklim Anlaşması normları vb.) takip etmek amacıyla geliştirilmiş bilimsel tabanlı bir analiz platformudur. Harran Üniversitesi Mühendislik Fakültesi akademik vizyonu doğrultusunda tasarlanan bu sistem, farklı ekolojik değişkenleri (enerji, su, ulaşım, atık, gıda) entegre bir biçimde değerlendirerek kullanıcılara veri odaklı çevresel iyileştirme raporları sunar.

## Bilimsel Metodoloji ve Katsayılar
Projenin hesaplama motoru (Backend), uluslararası ve ulusal bilimsel standartlara dayanan emisyon katsayılarını kullanmaktadır. Sistemdeki bazı temel referans değerler şunlardır:
- **Şebeke Elektriği (Türkiye):** 0.45 kg CO₂/kWh
- **Doğalgaz:** 2.02 kg CO₂/m³
- **Dizel & Benzin Yakıt:** Sırasıyla 2.65 ve 2.31 kg CO₂/Litre
- **Ağaç Karbon Emiş Kapasitesi:** Ortalama 22 kg CO₂/Yıl
- **Su Arıtma İzi:** 0.0003 kg CO₂/Litre (0.3 kg/m³)
- **Gıda İzi (Karışık/Vegan/Vej.):** Bilimsel literatüre uygun yıllık atanmış CO₂ katsayıları.

## Analiz Modülleri (Modüler Yapı)
Sistem, spesifik sürdürülebilirlik metriklerini ölçen 15 farklı alt modülden oluşmaktadır:

1. **Bireysel & Kurumsal Etki:** Kişisel ayak izi ve kurum/bina kaynaklı emisyonlar.
2. **Kampüs & Etkinlik:** Öğrenci ulaşımı, idari bina tüketimleri ve etkinlik tabanlı hesaplamalar.
3. **Ekolojik Tüketim:** Su ayak izi (doğrudan/dolaylı), Gıda ve Atık (Kompost) yönetimi.
4. **Verimlilik & Tasarruf:** Elektrikli Araç (EV) amortisman analizi, Ev Yalıtımı ve LED verimliliği.
5. **Yeşil Alan:** Ağaç yoğunluğu ve yıllık oksijen/karbon dengeleme (Offset) hesaplamaları.

## Teknoloji Yığını (Tech Stack)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 (Responsive UI).
- **Backend:** Node.js, Express.js (RESTful API mimarisi).
- **Deployment:** Render (Cloud Hosting).

## Kurulum ve Yerel Çalıştırma (Local Development)
Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Repoyu klonlayın:
   git clone [https://github.com/kullaniciadiniz/unigreen-sustainability.git](https://github.com/kullaniciadiniz/unigreen-sustainability.git)
2. Proje dizinine gidin ve bağımlılıkları yükleyin:
   cd unigreen-sustainability
   npm install
3. Sunucuyu başlatın:
   node server.js

🔗 Canlı Demo: [UniGreen Live](https://unigreen-sustainability.onrender.com/)
