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
        pageTitle: 'Pratikur - G\u00fcncel D\u00f6viz Kurlar\u0131 & Kur Ar\u015fivi',

        // Privacy
        privacyTitle: 'Gizlilik Politikas\u0131',
        privacyPageTitle: 'Gizlilik Politikas\u0131 - Pratikur',
        privacySonGuncelleme: 'Son G\u00fcncelleme:',
        privacySonGuncellemeTarih: '9 \u015eubat 2026',
        privacyGiris: 'Bu gizlilik politikas\u0131, Pratikur\'u kullan\u0131rken verilerinizin nas\u0131l topland\u0131\u011f\u0131n\u0131, kullan\u0131ld\u0131\u011f\u0131n\u0131 ve korundu\u011funu a\u00e7\u0131klar.',
        privacyBolum1Baslik: '1. Toplanan Bilgiler',
        privacyBolum1Metin: 'Uygulamam\u0131z, kullan\u0131c\u0131 gizlili\u011fine \u00f6nem verir ve ki\u015fisel verilerinizi toplamaz. Sadece uygulaman\u0131n \u00e7al\u0131\u015fmas\u0131 i\u00e7in gerekli olan ve kimli\u011finizi belirlemeyen veriler i\u015flenir:',
        privacyTeknikBilgi: 'Teknik Bilgiler:',
        privacyTeknikAciklama: 'Taray\u0131c\u0131 t\u00fcr\u00fc, cihaz modeli gibi anonim teknik veriler.',
        privacyYerelTercih: 'Yerel Tercihler:',
        privacyYerelAciklama: 'Se\u00e7ti\u011finiz para birimleri veya tema ayarlar\u0131 gibi tercihler sadece sizin cihaz\u0131n\u0131zda saklan\u0131r.',
        privacyBolum2Baslik: '2. \u00c7erezler ve Yerel Depolama (Local Storage)',
        privacyBolum2Metin: 'Herhangi bir sunucu taraf\u0131 \u00e7erez (cookie) kullanm\u0131yoruz. Ancak, kullan\u0131c\u0131 deneyiminizi iyile\u015ftirmek i\u00e7in taray\u0131c\u0131n\u0131z\u0131n Local Storage \u00f6zelli\u011fini kullanabiliriz. Bu, son yapt\u0131\u011f\u0131n\u0131z hesaplamalar\u0131 veya tercihlerinizi hat\u0131rlamamizi sa\u011flar. Bu veriler cihaz\u0131n\u0131zdan \u00e7\u0131kmaz.',
        privacyBolum3Baslik: '3. \u00dc\u00e7\u00fcnc\u00fc Taraf Hizmetler',
        privacyBolum3Metin: 'Uygulamam\u0131z d\u00f6viz kurlar\u0131n\u0131 sa\u011flamak i\u00e7in d\u0131\u015f kaynakl\u0131 API servislerini (Avrupa Merkez Bankas\u0131, T.C. Merkez Bankas\u0131) kullan\u0131r. Bu servislerle ileti\u015fim kurulurken IP adresiniz gibi standart a\u011f bilgileri bu sa\u011flay\u0131c\u0131lar taraf\u0131ndan g\u00f6r\u00fclebilir.',
        privacyBolum4Baslik: '4. G\u00fcvenlik',
        privacyBolum4Metin: 'Ki\u015fisel veri toplamad\u0131\u011f\u0131m\u0131z i\u00e7in, verilerinizin \u00e7al\u0131nmas\u0131 veya s\u0131zd\u0131r\u0131lmas\u0131 riski minimumdur. Uygulama ile ilgili t\u00fcm ileti\u015fim HTTPS protokol\u00fc \u00fczerinden \u015fifreli olarak ger\u00e7ekle\u015fir.',
        privacyBolum5Baslik: '5. \u0130leti\u015fim',
        privacyBolum5Metin: 'Bu politika hakk\u0131nda sorular\u0131n\u0131z varsa, l\u00fctfen geli\u015ftirici ile ileti\u015fime ge\u00e7in:',
        privacyGeriDon: 'Ana Sayfaya D\u00f6n',
        privacyFooter: '\u00a9 2026 Pratikur. T\u00fcm haklar\u0131 sakl\u0131d\u0131r.'
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
        pageTitle: 'Pratikur - Currency Rates & Rate Archive',

        // Privacy
        privacyTitle: 'Privacy Policy',
        privacyPageTitle: 'Privacy Policy - Pratikur',
        privacySonGuncelleme: 'Last Updated:',
        privacySonGuncellemeTarih: 'February 9, 2026',
        privacyGiris: 'This privacy policy explains how your data is collected, used, and protected when using Pratikur.',
        privacyBolum1Baslik: '1. Information Collected',
        privacyBolum1Metin: 'Our app values user privacy and does not collect personal data. Only anonymous data necessary for app functionality is processed:',
        privacyTeknikBilgi: 'Technical Information:',
        privacyTeknikAciklama: 'Anonymous technical data such as browser type and device model.',
        privacyYerelTercih: 'Local Preferences:',
        privacyYerelAciklama: 'Preferences such as selected currencies or theme settings are stored only on your device.',
        privacyBolum2Baslik: '2. Cookies and Local Storage',
        privacyBolum2Metin: 'We do not use any server-side cookies. However, we may use your browser\'s Local Storage feature to improve your experience. This allows us to remember your recent calculations or preferences. This data never leaves your device.',
        privacyBolum3Baslik: '3. Third-Party Services',
        privacyBolum3Metin: 'Our app uses external API services (European Central Bank, Central Bank of Turkey) to provide exchange rates. When communicating with these services, standard network information such as your IP address may be visible to these providers.',
        privacyBolum4Baslik: '4. Security',
        privacyBolum4Metin: 'Since we do not collect personal data, the risk of your data being stolen or leaked is minimal. All communication with the app occurs encrypted over the HTTPS protocol.',
        privacyBolum5Baslik: '5. Contact',
        privacyBolum5Metin: 'If you have questions about this policy, please contact the developer:',
        privacyGeriDon: 'Back to Home',
        privacyFooter: '\u00a9 2026 Pratikur. All rights reserved.'
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

    // Sayfa basligini data-i18n-title'dan al
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) document.title = t(titleKey);
    document.documentElement.lang = currentLang;
}

function setDil(lang) {
    currentLang = lang;
    localStorage.setItem('pratikur_lang', lang);
    document.getElementById('btnTr').classList.toggle('active', lang === 'tr');
    document.getElementById('btnEn').classList.toggle('active', lang === 'en');
    translatePage();

    // Dinamik icerikleri yeniden olustur (sadece ana sayfada)
    if (typeof kurListesiGuncelle === 'function') kurListesiGuncelle();
    if (typeof guncelKurlariGuncelle === 'function') guncelKurlariGuncelle();
}
