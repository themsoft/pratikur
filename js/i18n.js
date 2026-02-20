/* ============================================
   Pratikur - Coklu Dil Destegi (i18n)
   ============================================ */

const TRANSLATIONS = {
    tr: {
        // Header
        guncelKur: 'G\u00fcncel Kur',
        ecbKaynak: 'Avrupa Merkez Bankas\u0131 - G\u00fcnl\u00fck Kapan\u0131\u015f',
        uygulamaYukle: 'Uygulamay\u0131 Y\u00fckle',

        // Tabs
        tabListe: 'Liste',
        tabCevirici: '\u00c7evirici',
        tabArsiv: 'Kur Ar\u015fivi',

        // Tab 1
        paraBirimi: 'Para Birimi:',
        anaYabanci: 'Ana -> Yabanc\u0131',
        yabanciAna: 'Yabanc\u0131 -> Ana',
        excelIndir: 'Excel \u0130ndir',
        aramaPlaceholder: 'Para birimi ara... (\u00f6r: USD, Euro)',
        thParaBirimi: 'Para Birimi',
        thDeger: 'De\u011fer',
        thAlis: 'Al\u0131\u015f',
        thSatis: 'Sat\u0131\u015f',
        yukleniyor: 'Y\u00fckleniyor...',
        guncelleniyor: '\u23f3 G\u00fcncelleniyor...',
        verilerYuklenemedi: 'Veriler y\u00fcklenemedi.',

        // Tab 1 - Zaman bilgisi
        ecbKuru: 'Avrupa Merkez Bankas\u0131 Kuru',
        ecbKapanis: '(G\u00fcnl\u00fck Kapan\u0131\u015f)',
        tcmbKuru: 'T.C. Merkez Bankas\u0131 Kuru',
        tcmbAlisSatis: '(Al\u0131\u015f/Sat\u0131\u015f)',
        karsiligi: 'Karsiligi',
        biriminKarsiligi: 'Birimin',

        // Tab 2
        hizliCevirici: 'H\u0131zl\u0131 \u00c7evirici',
        miktar: 'Miktar:',
        buradan: 'Buradan:',
        buraya: 'Buraya:',
        hesapla: 'HESAPLA',
        hesaplamakIcin: 'Hesaplamak i\u00e7in butona bas\u0131n',
        sonHesaplamalar: 'Son Hesaplamalar',
        hesaplaniyor: 'Hesaplan\u0131yor...',
        ayniParaBirimi: 'Ayn\u0131 para birimi se\u00e7ili.',
        hesaplamaYapilamadi: 'Hesaplama yap\u0131lamad\u0131.',
        disclaimerEcb: 'Veriler Avrupa Merkez Bankas\u0131 kaynakl\u0131d\u0131r.',

        // Tab 3
        gecmisKurlar: 'Ge\u00e7mi\u015f Kurlar',
        baslangic: 'Ba\u015flang\u0131\u00e7:',
        bitis: 'Biti\u015f:',
        anaPara: 'Ana Para:',
        hedefPara: 'Hedef Para:',
        kurlariGetir: 'KURLARI GET\u0130R',
        thTarih: 'Tarih',
        thKurDegeri: 'Kur De\u011feri',
        tarihAraligi: 'Tarih aral\u0131\u011f\u0131 se\u00e7ip butona bas\u0131n.',
        tarihSecin: 'L\u00fctfen tarih aral\u0131\u011f\u0131 se\u00e7in.',
        tarihHata: 'Ba\u015flang\u0131\u00e7 tarihi biti\u015f tarihinden b\u00fcy\u00fck olamaz.',
        paraBirimiFarkli: 'Para birimleri farkl\u0131 olmal\u0131.',
        veriBulunamadi: 'Bu tarih aral\u0131\u011f\u0131 i\u00e7in veri bulunamad\u0131.',
        tcmbVeriBulunamadi: 'Bu tarih aral\u0131\u011f\u0131 i\u00e7in TCMB verisi bulunamad\u0131.',
        tcmbVerilerYuklenemedi: 'TCMB verileri y\u00fcklenemedi.',
        onceGetirin: '\u00d6nce kur verilerini getirmelisiniz.',
        indirilecekVeriYok: '\u0130ndirilecek veri yok.',
        gunYukleniyor: ' g\u00fcn y\u00fckleniyor...',

        // Footer
        gizlilikPolitikasi: 'Gizlilik Politikas\u0131',

        // Title
        pageTitle: 'Pratikur - G\u00fcncel D\u00f6viz Kurlar\u0131 & Kur Ar\u015fivi'
    },

    en: {
        // Header
        guncelKur: 'Current Rate',
        ecbKaynak: 'European Central Bank - Daily Close',
        uygulamaYukle: 'Install App',

        // Tabs
        tabListe: 'Rates',
        tabCevirici: 'Converter',
        tabArsiv: 'Archive',

        // Tab 1
        paraBirimi: 'Currency:',
        anaYabanci: 'Base -> Foreign',
        yabanciAna: 'Foreign -> Base',
        excelIndir: 'Download Excel',
        aramaPlaceholder: 'Search currency... (e.g. USD, Euro)',
        thParaBirimi: 'Currency',
        thDeger: 'Value',
        thAlis: 'Buying',
        thSatis: 'Selling',
        yukleniyor: 'Loading...',
        guncelleniyor: '\u23f3 Updating...',
        verilerYuklenemedi: 'Data could not be loaded.',

        // Tab 1 - Zaman bilgisi
        ecbKuru: 'European Central Bank Rate',
        ecbKapanis: '(Daily Close)',
        tcmbKuru: 'Central Bank of Turkey Rate',
        tcmbAlisSatis: '(Buying/Selling)',
        karsiligi: 'Equivalent',
        biriminKarsiligi: 'Unit',

        // Tab 2
        hizliCevirici: 'Quick Converter',
        miktar: 'Amount:',
        buradan: 'From:',
        buraya: 'To:',
        hesapla: 'CALCULATE',
        hesaplamakIcin: 'Press the button to calculate',
        sonHesaplamalar: 'Recent Calculations',
        hesaplaniyor: 'Calculating...',
        ayniParaBirimi: 'Same currency selected.',
        hesaplamaYapilamadi: 'Calculation failed.',
        disclaimerEcb: 'Data sourced from the European Central Bank.',

        // Tab 3
        gecmisKurlar: 'Historical Rates',
        baslangic: 'Start:',
        bitis: 'End:',
        anaPara: 'Base Currency:',
        hedefPara: 'Target Currency:',
        kurlariGetir: 'GET RATES',
        thTarih: 'Date',
        thKurDegeri: 'Rate Value',
        tarihAraligi: 'Select a date range and press the button.',
        tarihSecin: 'Please select a date range.',
        tarihHata: 'Start date cannot be after end date.',
        paraBirimiFarkli: 'Currencies must be different.',
        veriBulunamadi: 'No data found for this date range.',
        tcmbVeriBulunamadi: 'No TCMB data found for this date range.',
        tcmbVerilerYuklenemedi: 'TCMB data could not be loaded.',
        onceGetirin: 'Please fetch the rate data first.',
        indirilecekVeriYok: 'No data to download.',
        gunYukleniyor: ' days loading...',

        // Footer
        gizlilikPolitikasi: 'Privacy Policy',

        // Title
        pageTitle: 'Pratikur - Currency Rates & Rate Archive'
    }
};

let currentLang = localStorage.getItem('pratikur_lang') || 'tr';

function t(key) {
    const lang = TRANSLATIONS[currentLang] || TRANSLATIONS.tr;
    return lang[key] || TRANSLATIONS.tr[key] || key;
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    document.title = t('pageTitle');
    document.documentElement.lang = currentLang;
}

function setDil(lang) {
    currentLang = lang;
    localStorage.setItem('pratikur_lang', lang);
    document.getElementById('btnTr').classList.toggle('active', lang === 'tr');
    document.getElementById('btnEn').classList.toggle('active', lang === 'en');
    translatePage();

    // Dinamik icerikleri yeniden olustur
    kurListesiGuncelle();
    guncelKurlariGuncelle();
}
