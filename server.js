const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Public klasörünü bağlama
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Bilimsel Emisyon Katsayıları (kg CO2)
const GRID_EMISSION = 0.45;       // 1 kWh Türkiye Şebeke Elektriği
const GAS_EMISSION = 2.02;        // 1 m3 Doğalgaz
const DIESEL_EMISSION = 2.65;     // 1 Litre Dizel
const GASOLINE_EMISSION = 2.31;   // 1 Litre Benzin
const PAPER_EMISSION_KG = 1.2;    // 1 kg Kağıt
const PAPER_EMISSION_SHEET = 0.006; // 1 adet A4 Kağıdı (Standart)
const PAPER_RECYCLED_SHEET = 0.003; // 1 adet A4 Kağıdı (Geri Dönüşümlü)
const WATER_TREATMENT_EMISSION = 0.0003; // 1 Litre suyun arıtma karbon izi (0.3 kg/m3)

// Ekonomik Veriler (TL)
const ELECTRIC_PRICE = 3.0;
const GASOLINE_PRICE = 52.0;
const DIESEL_PRICE = 50.0;

// Yuvarlama Fonksiyonu
const round = (value) => Math.round(value * 100) / 100;

// Veri okuma yardımcısı (Boş verileri veya eksik girdileri 0 kabul eder)
const getVal = (data, key, defaultVal = 0.0) => {
    return data[key] !== undefined && data[key] !== null && !isNaN(data[key]) ? Number(data[key]) : defaultVal;
};

app.post('/api/calculate/:type', (req, res) => {
    const type = req.params.type;
    const data = req.body;
    
    let result = {};
    let total = 0;

    try {
        switch (type) {
            case "personal":
                let ulasim = getVal(data, "ulasim") * 0.18;
                let elek = getVal(data, "elek") * GRID_EMISSION * 12;
                let gas = getVal(data, "gas") * GAS_EMISSION * 12;
                let flight = getVal(data, "flightKm") * 0.20; // Düzeltilmiş bilimsel havacılık katsayısı
                
                let dietType = parseInt(getVal(data, "beslenmeTarzi", 3));
                let beslenme = 1500; 
                if (dietType === 1) beslenme = 600;      
                else if (dietType === 2) beslenme = 900; 
                else if (dietType === 3) beslenme = 1500; 
                else if (dietType === 4) beslenme = 2500; 
                
                total = ulasim + elek + gas + flight + beslenme;
                result["Yıllık Ulaşım"] = `${round(ulasim)} kg CO2`;
                result["Yıllık Ev Enerjisi"] = `${round(elek + gas)} kg CO2`;
                result["Yıllık Uçuş İzi"] = `${round(flight)} kg CO2`;
                result["Yıllık Beslenme"] = `${round(beslenme)} kg CO2`;
                break;

            case "corporate":
                let cElek = getVal(data, "cElek") * GRID_EMISSION;
                let cGas = getVal(data, "cGas") * GAS_EMISSION;
                let cFilo = getVal(data, "cFilo") * DIESEL_EMISSION;
                let paper = getVal(data, "paper") * PAPER_EMISSION_KG;
                total = cElek + cGas + cFilo + paper;
                result["Bina Kaynaklı"] = `${round(cElek + cGas)} kg CO2`;
                result["Filo Kaynaklı"] = `${round(cFilo)} kg CO2`;
                result["Kişi Başı Ortalama"] = `${round(total / Math.max(1, getVal(data, "emp", 1.0)))} kg CO2`;
                break;

            case "event":
                let p = getVal(data, "participants");
                let eTransport = p * getVal(data, "dist") * 0.18;
                let eFood = p * getVal(data, "days") * getVal(data, "foodFactor", 4.0);
                let eHotel = p * getVal(data, "hotelNights") * 15.0;
                total = eTransport + eFood + eHotel;
                result["Ulaşım İzi"] = `${round(eTransport)} kg CO2`;
                result["Gıda ve Konaklama İzi"] = `${round(eFood + eHotel)} kg CO2`;
                break;

            case "water":
                let directWater = (getVal(data, "dus") * 10 * 365) +
                                  (getVal(data, "dis") * 4 * 365) +
                                  (getVal(data, "bulasik") * 8 * 365) +
                                  (getVal(data, "camasir") * 50 * 52) +
                                  (getVal(data, "icme") * 365);
                let indirectWater = (getVal(data, "et") * 15 * 365) +
                                    (getVal(data, "tahil") * 1.6 * 365) +
                                    (getVal(data, "sut") * 5 * 365);
                total = directWater + indirectWater;
                result["Doğrudan Su Kullanımı"] = `${round(directWater)} Litre/Yıl`;
                result["Dolaylı (Gıda) Su İzi"] = `${round(indirectWater)} Litre/Yıl`;
                result["Günlük Ortalama"] = `${round(total / 365)} Litre/Gün`;
                break;

            case "energy_efficiency":
                let savedKwh = ((getVal(data, "oldW") - getVal(data, "ledW")) * getVal(data, "lCount") * getVal(data, "lHours") * 365) / 1000;
                total = savedKwh * GRID_EMISSION;
                result["Yıllık Enerji Tasarrufu"] = `${round(savedKwh)} kWh`;
                result["Yıllık Maliyet Tasarrufu"] = `${round(savedKwh * ELECTRIC_PRICE)} TL`;
                break;

            case "home_energy":
                // GÜNCELLEME: Sabit %15 yerine kullanıcının hedefine göre dinamik tasarruf
                let hBill = getVal(data, "hBill");
                let savingPct = getVal(data, "hSavingPct") / 100;
                let billSave = hBill * 12 * savingPct;
                
                let yearlyKwhSaved = (billSave / ELECTRIC_PRICE);
                total = yearlyKwhSaved * GRID_EMISSION; 
                let payback = getVal(data, "hCost") / Math.max(1, billSave);
                
                result["Yıllık Finansal Tasarruf"] = `${round(billSave)} TL`;
                result["Önlenen Emisyon"] = `${round(total)} kg CO2`;
                result["Yatırımın Amortismanı"] = `${round(payback)} Yıl`;
                break;

            case "ev":
                // ÖNCEKİ SÜRÜMDE İSTENEN EV FORMÜLLERİ (AYNEN KORUNDU)
                let evKm = getVal(data, "evKm");
                let evCons = getVal(data, "evCons", 16.0);
                let gasCons = getVal(data, "gasCons", 7.0);
                let dieselCons = getVal(data, "dieselCons", 5.5);
                let evPrice = getVal(data, "evPrice", 1800000);
                let icPrice = getVal(data, "icPrice", 1350000);

                let costEV = (evKm / 100) * evCons * ELECTRIC_PRICE;
                let costGas = (evKm / 100) * gasCons * GASOLINE_PRICE;
                let costDiesel = (evKm / 100) * dieselCons * DIESEL_PRICE;

                let saveGas = costGas - costEV;
                let saveDiesel = costDiesel - costEV;
                let priceDiff = evPrice - icPrice;

                let oldCo2 = (evKm / 100) * gasCons * GASOLINE_EMISSION;
                let newCo2 = (evKm / 100) * evCons * GRID_EMISSION;
                total = oldCo2 - newCo2;

                result["Yıllık EV Enerji Maliyeti"] = `${round(costEV)} TL`;
                result["Yıllık Benzinli Yakıt Maliyeti"] = `${round(costGas)} TL`;
                result["Yıllık Dizel Yakıt Maliyeti"] = `${round(costDiesel)} TL`;
                result["Benzinliye Göre Tasarruf"] = `${round(saveGas)} TL`;
                result["Dizele Göre Tasarruf"] = `${round(saveDiesel)} TL`;

                if (priceDiff > 0) {
                    if (saveGas > 0) result["Benzinliye Göre Amortisman"] = `${round(priceDiff / saveGas)} Yıl`;
                    if (saveDiesel > 0) result["Dizele Göre Amortisman"] = `${round(priceDiff / saveDiesel)} Yıl`;
                } else {
                    result["Amortisman"] = "Araç Fiyat Farkı Yok / EV Daha Ucuz";
                }
                break;

            case "transport_comp":
                let yKm = getVal(data, "tDist") * getVal(data, "tDays") * 52;
                total = yKm * 0.20; 
                result["Dizel Eşdeğeri"] = `${round(yKm * 0.17)} kg CO2`;
                result["Otobüs Eşdeğeri"] = `${round(yKm * 0.08)} kg CO2`;
                result["Metro Eşdeğeri"] = `${round(yKm * 0.04)} kg CO2`;
                break;

            case "food":
                let meatCo2 = ((getVal(data, "fRed") * 27) + (getVal(data, "fWhite") * 6) + (getVal(data, "fFish") * 5)) * 52;
                let sustainScore = (getVal(data, "fLocal") + getVal(data, "fSeason") + getVal(data, "fOrg")) / 3.0;
                total = meatCo2;
                result["Kırmızı Et Kaynaklı"] = `${round(getVal(data, "fRed") * 27 * 52)} kg CO2/Yıl`;
                result["Sürdürülebilirlik Puanı"] = `${round(sustainScore)}/100`;
                break;

            case "waste":
                // GÜNCELLEME: Organik atıkların kompostlama ile metan önleme hesabı eklendi
                let recycledPlast = getVal(data, "wPlast") * (getVal(data, "rPlast") / 100);
                let recycledPaper = getVal(data, "wPaper") * (getVal(data, "rPaper") / 100);
                let compostedOrg = getVal(data, "wOrg") * (getVal(data, "rOrg") / 100);
                
                let dailyRecycled = recycledPlast + recycledPaper + compostedOrg;
                // Plastik 2.5kg, Kağıt 1.2kg, Organik (Metan sızıntısı önleme) 0.5kg CO2eş önler (Ortalama)
                total = (recycledPlast * 2.5 + recycledPaper * 1.2 + compostedOrg * 0.5) * 365;
                
                result["Yıllık Toplam Geri Kazanım"] = `${round(dailyRecycled * 365)} kg Atık`;
                result["Kompostlanan Organik"] = `${round(compostedOrg * 365)} kg Atık`;
                break;

            case "paper":
                // GÜNCELLEME: Halihazırda kullanılan geri dönüşümlü kağıt oranı formüle edildi
                let pRecycled = getVal(data, "pRecycled") / 100;
                let pTarget = getVal(data, "pTarget") / 100;
                let yearlySheets = getVal(data, "pCount") * 12;
                
                // Normal kağıt (0.006) vs Geri dönüşümlü kağıt (0.003) karışımı mevcut emisyon
                let currentEmission = yearlySheets * ((pRecycled * PAPER_RECYCLED_SHEET) + ((1 - pRecycled) * PAPER_EMISSION_SHEET));
                let preventedCo2 = currentEmission * pTarget;
                
                total = currentEmission - preventedCo2; // Hedef sonrası kalan emisyon
                result["Mevcut Kağıt İzi"] = `${round(currentEmission)} kg CO2`;
                result["Dijitalleşme Kazanımı"] = `${round(preventedCo2)} kg CO2 Tasarrufu`;
                break;

            case "green_space":
                // GÜNCELLEME: Alan verisi "Ağaç Yoğunluğu" hesabı için aktif edildi
                let totalTrees = getVal(data, "gTrees") + getVal(data, "gNew");
                let areaSqM = Math.max(1, getVal(data, "gArea")); 
                let treeDensity = (totalTrees / areaSqM) * 1000; // 1 Dönüm (1000m2) başına düşen ağaç
                
                total = totalTrees * 22;
                result["Toplam Ağaç Varlığı"] = `${round(totalTrees)} Adet`;
                result["Dönüm Başına Ağaç"] = `${round(treeDensity)} Adet / 1000m²`;
                result["Yıllık Oksijen Üretimi"] = `${round(totalTrees * 100)} kg O2`;
                break;

            case "climate_impact":
                let footprint = getVal(data, "cFootprint");
                total = footprint * getVal(data, "cLife", 75.0);
                result["Küresel Paris Anlaşması Limiti"] = "2000 kg CO2/Yıl";
                result["Mevcut Hedef Sapması"] = `${round((footprint / 2000) * 100)} %`;
                break;

            case "campus":
                // GÜNCELLEME: Kampüs günlük su verisi (arıtma enerjisi kaynaklı) hesaba dahil edildi
                let bldgEmission = (getVal(data, "cBldgA") + getVal(data, "cBldgB")) * GRID_EMISSION;
                // Öğrenci ulaşımı: %x araç kullanıyor, ortalama akademik yıl 200 gün
                let transportEmission = getVal(data, "cStudent") * (getVal(data, "cCarPct") / 100) * 200 * 0.18;
                // Su emisyonu: Yılda kullanılan su (Litre) * 0.0003 kg CO2/Litre
                let waterEmission = getVal(data, "cWater") * 365 * WATER_TREATMENT_EMISSION;
                
                total = bldgEmission + transportEmission + waterEmission;
                result["Binaların Yıllık Emisyonu"] = `${round(bldgEmission)} kg CO2`;
                result["Öğrenci Ulaşımı Emisyonu"] = `${round(transportEmission)} kg CO2`;
                result["Su Tüketimi (Arıtma) Emisyonu"] = `${round(waterEmission)} kg CO2`;
                break;

            case "cafeteria":
                // GÜNCELLEME: Salt puan yerine günlük servis sayısıyla emisyon tonajı çıkarıldı
                let meals = getVal(data, "meals");
                let organic = getVal(data, "organic") / 100;
                let local = getVal(data, "local") / 100;
                let recycle = getVal(data, "recycle") / 100;
                
                // Normal bir öğün ortalama 2.5 kg CO2. 
                // Tamamen yerel, vegan/organik ve sıfır atık hedefine ulaşıldığında bu 1.0 kg CO2'ye düşer.
                let sustainabilityMultiplier = (organic * 0.4) + (local * 0.4) + (recycle * 0.2); 
                let avgMealCo2 = 2.5 - (sustainabilityMultiplier * 1.5); 
                
                total = meals * 200 * avgMealCo2; // 200 Akademik gün
                let preventedByGreenFood = meals * 200 * (2.5 - avgMealCo2);

                result["Ortalama Öğün Karbon İzi"] = `${round(avgMealCo2)} kg CO2 / Öğün`;
                result["Önlenen Emisyon (Sürdürülebilirlik)"] = `${round(preventedByGreenFood)} kg CO2`;
                break;

            default:
                return res.status(400).json({ error: "Geçersiz modül." });
        }

        result.success = true;
        
        // Tasarruf / Önlenen hesaplaması yapılan modüllerde eksi değerli ağaç gösterimi olmaması için Math.abs kullanıldı
        result.total = round(Math.abs(total)); 

        if (type !== "water") {
            result.trees = Math.ceil(Math.abs(total) / 22.0);
        } else {
            result.trees = 0;
        }

        return res.json(result);

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`UniGreen Backend Node.js üzerinde çalışıyor: http://localhost:${PORT}`);
});