/* ============================================
   Pratikur - Döviz Kuru Takip Uygulaması
   ============================================ */

// --- State ---
let tumParaBirimleri = {};
let sonGelenVeri = null;
let sonGecmisVeri = null;
let currentDirection = 'ters';
let currentKaynak = localStorage.getItem('pratikur_kaynak') || 'ecb';
let deferredPrompt;
let favoriler = JSON.parse(localStorage.getItem('pratikur_favorites') || '[]');
let currentTheme = localStorage.getItem('pratikur_theme') || 'light';

// =============================================
// Tema
// =============================================

function temaDegistir() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('pratikur_theme', currentTheme);
    temaUygula();
}

function temaUygula() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.content = currentTheme === 'dark' ? '#111827' : '#ffffff';
    }
    const colorScheme = document.querySelector('meta[name="color-scheme"]');
    if (colorScheme) {
        colorScheme.content = currentTheme === 'dark' ? 'dark' : 'light';
    }
}

// Sayfa yuklendiginde tema tercihini hemen uygula
temaUygula();

// =============================================
// PWA
// =============================================

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
    navigator.serviceWorker.register('sw.js')
        .catch(() => {});
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').classList.remove('hidden');
});

function uygulamayiYukle() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                document.getElementById('installBtn').classList.add('hidden');
            }
            deferredPrompt = null;
        });
    }
}

// =============================================
// Güncel Kur
// =============================================

function kaynakInfoToggle() {
    var box = document.getElementById('kaynakInfoBox');
    if (box) box.classList.toggle('hidden');
}

function kaynakBilgisiniGuncelle(kaynak, dateStr) {
    const zamanBox = document.getElementById('zamanGosterge');
    if (!zamanBox) return;

    const tarih = dateStr ? formatTarih(dateStr) : '';

    zamanBox.textContent = '';
    const icon = document.createElement('i');
    icon.className = 'fas fa-info-circle';
    zamanBox.appendChild(icon);

    if (kaynak === 'ecb') {
        zamanBox.appendChild(document.createTextNode(' ' + t('ecbKuru') + ' '));
        const bold = document.createElement('b');
        bold.textContent = t('ecbKapanis');
        zamanBox.appendChild(bold);
    } else {
        zamanBox.appendChild(document.createTextNode(' ' + t('tcmbKuru') + ' '));
        const bold = document.createElement('b');
        bold.textContent = t('tcmbAlisSatis');
        zamanBox.appendChild(bold);
    }

    if (tarih) {
        zamanBox.appendChild(document.createTextNode(' - ' + tarih));
    }
}

function guncelKurlariGoster() {
    fetchWithRetry('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD,GBP')
        .then(data => {
            var eurTry = data.rates.TRY;
            var eurUsd = data.rates.USD;
            var eurGbp = data.rates.GBP;
            var usdTry = eurTry / eurUsd;
            var gbpTry = eurTry / eurGbp;

            document.getElementById('guncelUsd').textContent = usdTry.toFixed(4);
            document.getElementById('guncelEur').textContent = eurTry.toFixed(4);
            document.getElementById('guncelGbp').textContent = gbpTry.toFixed(4);
            document.getElementById('guncelEurUsd').textContent = eurUsd.toFixed(4);
            kaynakBilgisiniGuncelle('ecb', data.date);
        })
        .catch(() => {
            ['guncelUsd', 'guncelEur', 'guncelGbp', 'guncelEurUsd'].forEach(function(id) {
                document.getElementById(id).textContent = '--';
            });
            kaynakBilgisiniGuncelle('ecb', null);
        });
}

// =============================================
// API (Frankfurter)
// =============================================

async function paraBirimleriniGetir() {
    try {
        tumParaBirimleri = await fetchWithRetry('https://api.frankfurter.dev/v1/currencies');

        const selectIds = ['baseCurrencySelect', 'calcFrom', 'calcTo', 'histBase', 'histTarget', 'statBase', 'statTarget'];
        selectIds.forEach(id => {
            const el = document.getElementById(id);
            el.textContent = '';
            Object.entries(tumParaBirimleri).forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.text = `${code} - ${name}`;
                el.appendChild(option);
            });
        });

        document.getElementById('baseCurrencySelect').value = 'TRY';
        document.getElementById('calcFrom').value = 'USD';
        document.getElementById('calcTo').value = 'TRY';
        document.getElementById('histBase').value = 'USD';
        document.getElementById('histTarget').value = 'TRY';
        document.getElementById('statBase').value = 'USD';
        document.getElementById('statTarget').value = 'TRY';

        // Varsayilan tarih araligi
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);
        document.getElementById('histEndDate').valueAsDate = today;
        document.getElementById('histStartDate').valueAsDate = lastWeek;

        // Istatistik: son 30 gun
        const lastMonth = new Date();
        lastMonth.setDate(today.getDate() - 30);
        document.getElementById('statEndDate').valueAsDate = today;
        document.getElementById('statStartDate').valueAsDate = lastMonth;
    } catch (e) {
        console.error('Para birimleri alinamadi:', e);
    }
}

// =============================================
// Tab 1 - Kur Listesi
// =============================================

function baseCurrencyDoldur(kaynak) {
    const select = document.getElementById('baseCurrencySelect');
    const onceki = select.value;
    select.textContent = '';

    if (kaynak === 'tcmb') {
        // TRY'yi ilk secenek olarak ekle
        const tryOpt = document.createElement('option');
        tryOpt.value = 'TRY';
        tryOpt.text = 'TRY - ' + (currentLang === 'en' ? 'Turkish Lira' : 'T\u00fcrk Liras\u0131');
        select.appendChild(tryOpt);

        // TCMB para birimlerini ekle
        Object.entries(tcmbParaBirimleri).forEach(([code, info]) => {
            const option = document.createElement('option');
            option.value = code;
            const name = (currentLang === 'en') ? (info.nameEn || info.nameTr) : info.nameTr;
            option.text = `${code} - ${name}`;
            select.appendChild(option);
        });
    } else {
        // ECB para birimlerini ekle
        Object.entries(tumParaBirimleri).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.text = `${code} - ${name}`;
            select.appendChild(option);
        });
    }

    // Onceki secimi koru, yoksa TRY
    const mevcutMu = [...select.options].some(o => o.value === onceki);
    select.value = mevcutMu ? onceki : 'TRY';
}

function setKaynak(kaynak) {
    currentKaynak = kaynak;
    localStorage.setItem('pratikur_kaynak', kaynak);
    document.getElementById('btnEcb').classList.toggle('active', kaynak === 'ecb');
    document.getElementById('btnTcmb').classList.toggle('active', kaynak === 'tcmb');

    // Tablo basligini guncelle
    const thead = document.querySelector('#kurTablosu thead tr');
    thead.textContent = '';
    if (kaynak === 'tcmb') {
        [t('thParaBirimi'), t('thAlis'), t('thSatis')].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            thead.appendChild(th);
        });
    } else {
        const th1 = document.createElement('th');
        th1.textContent = t('thParaBirimi');
        const th2 = document.createElement('th');
        th2.id = 'tabloBaslikDeger';
        th2.textContent = t('thDeger');
        thead.appendChild(th1);
        thead.appendChild(th2);
    }

    // Para birimi dropdown'unu guncelle
    baseCurrencyDoldur(kaynak);

    // Arsiv kontollerini guncelle (global kaynak secimi)
    arsivKontrolleriniGuncelle(kaynak);

    // Istatistik kontrollerini guncelle
    istatistikKontrolleriniGuncelle(kaynak);

    // Cevirici dropdown'larini guncelle
    ceviriciDropdownGuncelle(kaynak);

    // TCMB satis kuru etiketini goster/gizle
    var tcmbEtiket = document.getElementById('tcmbEtiket');
    if (tcmbEtiket) {
        tcmbEtiket.classList.toggle('hidden', kaynak !== 'tcmb');
        tcmbEtiket.textContent = t('satisKuru');
    }

    // Guncel kur, tablo ve favoriler guncelle
    guncelKurlariGuncelle();
    kurListesiGuncelle();
    favorileriGoster();
}

function guncelKurlariGuncelle() {
    if (currentKaynak === 'tcmb') {
        tcmbGuncelKurlariGoster();
    } else {
        guncelKurlariGoster();
    }
}

function kurListesiGuncelle() {
    const base = document.getElementById('baseCurrencySelect').value;
    if (currentKaynak === 'tcmb') {
        tcmbTablosuGuncelle(base);
    } else {
        tabloyuGuncelle();
    }
}

function setDirection(dir) {
    currentDirection = dir;
    document.getElementById('btnDuz').classList.toggle('active', dir === 'duz');
    document.getElementById('btnTers').classList.toggle('active', dir === 'ters');
    kurListesiGuncelle();
}

function tabloyuGuncelle() {
    const base = document.getElementById('baseCurrencySelect').value;
    const tbody = document.getElementById('kurListesiBody');
    const baslik = document.getElementById('tabloBaslikDeger');

    baslik.innerText = currentDirection === 'duz'
        ? `1 ${base} ${t('karsiligi')}`
        : `1 ${t('biriminKarsiligi')} ${base} ${t('karsiligi')}`;

    tbody.textContent = '';
    const loadingRow = document.createElement('tr');
    const loadingCell = document.createElement('td');
    loadingCell.colSpan = 2;
    loadingCell.align = 'center';
    loadingCell.textContent = t('guncelleniyor');
    loadingRow.appendChild(loadingCell);
    tbody.appendChild(loadingRow);

    fetchWithRetry(`https://api.frankfurter.dev/v1/latest?base=${base}`)
        .then(data => {
            sonGelenVeri = data;
            tbody.textContent = '';

            Object.entries(data.rates).forEach(([kod, oran]) => {
                const deger = currentDirection === 'duz' ? oran : (1 / oran);
                const tr = document.createElement('tr');

                const tdName = document.createElement('td');

                // Favori yildiz ikonu
                const star = document.createElement('i');
                star.className = favoriler.includes(kod) ? 'fas fa-star favori-yildiz aktif' : 'far fa-star favori-yildiz';
                star.title = favoriler.includes(kod) ? t('favorilerdenCikar') : t('favorilereEkle');
                star.onclick = (e) => { e.stopPropagation(); toggleFavori(kod); };
                tdName.appendChild(star);

                const kodBold = document.createElement('b');
                kodBold.textContent = kod;
                tdName.appendChild(kodBold);
                tdName.appendChild(document.createTextNode(' '));
                const kodSpan = document.createElement('span');
                kodSpan.className = 'currency-name-detail';
                kodSpan.textContent = tumParaBirimleri[kod] || '';
                tdName.appendChild(kodSpan);

                const tdVal = document.createElement('td');
                if (currentDirection === 'duz') {
                    tdVal.appendChild(document.createTextNode(`1 ${base} = `));
                    const valBold = document.createElement('b');
                    valBold.textContent = formatla(deger);
                    tdVal.appendChild(valBold);
                    tdVal.appendChild(document.createTextNode(` ${kod}`));
                } else {
                    tdVal.appendChild(document.createTextNode(`1 ${kod} = `));
                    const valBold = document.createElement('b');
                    valBold.textContent = formatla(deger);
                    tdVal.appendChild(valBold);
                    tdVal.appendChild(document.createTextNode(` ${base}`));
                }

                tr.appendChild(tdName);
                tr.appendChild(tdVal);
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('Kur listesi alinamadi:', err);
            tbody.textContent = '';
            const errRow = document.createElement('tr');
            const errCell = document.createElement('td');
            errCell.colSpan = 2;
            errCell.align = 'center';
            errCell.className = 'error-text';
            errCell.textContent = t('verilerYuklenemedi');
            errRow.appendChild(errCell);
            tbody.appendChild(errRow);
        });
}

// =============================================
// Tab 2 - \u00c7evirici
// =============================================

function swapCurrencies() {
    const fromEl = document.getElementById('calcFrom');
    const toEl = document.getElementById('calcTo');
    const temp = fromEl.value;
    fromEl.value = toEl.value;
    toEl.value = temp;
}

function ozelHesapla() {
    if (currentKaynak === 'tcmb') {
        tcmbOzelHesapla();
        return;
    }

    const amt = document.getElementById('calcAmount').value;
    const from = document.getElementById('calcFrom').value;
    const to = document.getElementById('calcTo').value;
    const resBox = document.getElementById('calcResult');

    if (from === to) {
        resBox.textContent = t('ayniParaBirimi');
        return;
    }

    resBox.textContent = '';
    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    resBox.appendChild(spinner);
    resBox.appendChild(document.createTextNode(' ' + t('hesaplaniyor')));

    fetchWithRetry(`https://api.frankfurter.dev/v1/latest?amount=${amt}&from=${from}&to=${to}`)
        .then(d => {
            const formatted = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: to
            }).format(d.rates[to]);
            resBox.textContent = '';
            resBox.appendChild(document.createTextNode(`${amt} ${from} = `));
            const valBold = document.createElement('b');
            valBold.textContent = formatted;
            resBox.appendChild(valBold);
            updateHistory(`${amt} ${from} -> ${d.rates[to].toFixed(2)} ${to}`);
        })
        .catch(err => {
            console.error('Hesaplama hatasi:', err);
            resBox.textContent = t('hesaplamaYapilamadi');
        });
}

function updateHistory(text) {
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    // localStorage'a kaydet
    let history = JSON.parse(localStorage.getItem('pratikur_history') || '[]');
    history.unshift({ text, time });
    if (history.length > 5) history = history.slice(0, 5);
    localStorage.setItem('pratikur_history', JSON.stringify(history));

    renderHistory();
}

function renderHistory() {
    const ul = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('pratikur_history') || '[]');
    ul.textContent = '';

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';

        const spanText = document.createElement('span');
        spanText.textContent = item.text;
        const spanTime = document.createElement('span');
        spanTime.className = 'history-time';
        spanTime.textContent = item.time;

        li.appendChild(spanText);
        li.appendChild(spanTime);
        ul.appendChild(li);
    });
}

// =============================================
// Tab 3 - Kur Arsivi
// =============================================

function gecmisKurlariGetir() {
    const start = document.getElementById('histStartDate').value;
    const end = document.getElementById('histEndDate').value;
    const base = document.getElementById('histBase').value;
    const target = document.getElementById('histTarget').value;
    const tbody = document.getElementById('historyBody');

    if (!start || !end) { alert(t('tarihSecin')); return; }
    if (start > end) { alert(t('tarihHata')); return; }
    if (base === target) { alert(t('paraBirimiFarkli')); return; }

    tbody.textContent = '';
    const loadRow = document.createElement('tr');
    const loadCell = document.createElement('td');
    loadCell.colSpan = 2;
    loadCell.align = 'center';
    const loadSpinner = document.createElement('i');
    loadSpinner.className = 'fas fa-spinner fa-spin';
    loadCell.appendChild(loadSpinner);
    loadCell.appendChild(document.createTextNode(' ' + t('yukleniyor')));
    loadRow.appendChild(loadCell);
    tbody.appendChild(loadRow);

    fetchWithRetry(`https://api.frankfurter.dev/v1/${start}..${end}?from=${base}&to=${target}`)
        .then(data => {
            sonGecmisVeri = data;
            tbody.textContent = '';

            if (!data.rates || Object.keys(data.rates).length === 0) {
                const emptyRow = document.createElement('tr');
                const emptyCell = document.createElement('td');
                emptyCell.colSpan = 2;
                emptyCell.align = 'center';
                emptyCell.textContent = t('veriBulunamadi');
                emptyRow.appendChild(emptyCell);
                tbody.appendChild(emptyRow);
                return;
            }

            const dates = Object.keys(data.rates).sort().reverse();
            dates.forEach(date => {
                const rate = data.rates[date][target];
                const formattedDate = formatTarih(date);

                const tr = document.createElement('tr');
                const tdDate = document.createElement('td');
                tdDate.textContent = formattedDate;
                const tdRate = document.createElement('td');
                tdRate.appendChild(document.createTextNode(`1 ${base} = `));
                const rateBold = document.createElement('b');
                rateBold.textContent = rate.toFixed(4);
                tdRate.appendChild(rateBold);
                tdRate.appendChild(document.createTextNode(` ${target}`));

                tr.appendChild(tdDate);
                tr.appendChild(tdRate);
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('Gecmis kur hatasi:', err);
            tbody.textContent = '';
            const errRow = document.createElement('tr');
            const errCell = document.createElement('td');
            errCell.colSpan = 2;
            errCell.align = 'center';
            errCell.className = 'error-text';
            errCell.textContent = `Hata: ${err.message}`;
            errRow.appendChild(errCell);
            tbody.appendChild(errRow);
        });
}

// =============================================
// Export (CSV)
// =============================================

function excelIndir() {
    if (!sonGelenVeri) return;

    let csv = `data:text/csv;charset=utf-8,\uFEFF${t('thParaBirimi')};${t('thDeger')}\n`;
    Object.entries(sonGelenVeri.rates).forEach(([k, v]) => {
        const val = currentDirection === 'duz' ? v : (1 / v);
        csv += `${k};${String(val.toFixed(4)).replace('.', ',')}\n`;
    });

    csvIndir(`kur_listesi_${currentDirection}.csv`, csv);
}

function gecmisExcelIndir() {
    if (!sonGecmisVeri) {
        alert(t('onceGetirin'));
        return;
    }

    // TCMB gecmis verisi
    if (sonGecmisVeri.tcmb) {
        if (!sonGecmisVeri.results || sonGecmisVeri.results.length === 0) {
            alert(t('indirilecekVeriYok'));
            return;
        }
        let csv = `data:text/csv;charset=utf-8,\uFEFF${t('thTarih')};${t('thAlis')};${t('thSatis')}\n`;
        sonGecmisVeri.results.forEach(item => {
            const formattedDate = formatTarih(item.date);
            csv += `${formattedDate};${String(item.buying.toFixed(4)).replace('.', ',')};${String(item.selling.toFixed(4)).replace('.', ',')}\n`;
        });
        csvIndir(`kur_arsivi_TCMB_${sonGecmisVeri.target}.csv`, csv);
        return;
    }

    // ECB gecmis verisi
    if (!sonGecmisVeri.rates) {
        alert(t('onceGetirin'));
        return;
    }

    const dates = Object.keys(sonGecmisVeri.rates).sort().reverse();
    if (dates.length === 0) {
        alert(t('indirilecekVeriYok'));
        return;
    }

    const base = sonGecmisVeri.base || document.getElementById('histBase').value;
    const target = Object.keys(sonGecmisVeri.rates[dates[0]])[0];

    let csv = `data:text/csv;charset=utf-8,\uFEFF${t('thTarih')};1 ${base} ${t('karsiligi')} (${target})\n`;
    dates.forEach(date => {
        const rate = sonGecmisVeri.rates[date][target];
        if (rate !== undefined) {
            const formattedDate = formatTarih(date);
            csv += `${formattedDate};${String(rate.toFixed(4)).replace('.', ',')}\n`;
        }
    });

    csvIndir(`kur_arsivi_${base}_${target}.csv`, csv);
}

// =============================================
// Favoriler
// =============================================

function toggleFavori(kod) {
    const idx = favoriler.indexOf(kod);
    if (idx > -1) {
        favoriler.splice(idx, 1);
    } else {
        if (favoriler.length >= 6) return; // Max 6 favori
        favoriler.push(kod);
    }
    localStorage.setItem('pratikur_favorites', JSON.stringify(favoriler));
    favorileriGoster();
    kurListesiGuncelle();
}

function favorileriGoster() {
    const container = document.getElementById('favoriContainer');
    container.textContent = '';

    if (favoriler.length === 0) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');

    if (currentKaynak === 'tcmb') {
        tcmbKurlariGetir().then(data => {
            container.textContent = '';
            favoriler.forEach(kod => {
                if (!data.rates[kod]) return;
                const card = document.createElement('div');
                card.className = 'favori-card';

                const label = document.createElement('span');
                label.className = 'favori-card-label';
                label.textContent = kod + '/TRY';
                card.appendChild(label);

                const val = document.createElement('span');
                val.className = 'favori-card-value';
                val.textContent = data.rates[kod].selling.toFixed(4);
                card.appendChild(val);

                const silBtn = document.createElement('button');
                silBtn.className = 'favori-sil-btn';
                silBtn.innerHTML = '<i class="fas fa-times"></i>';
                silBtn.title = t('favorilerdenCikar');
                silBtn.onclick = () => toggleFavori(kod);
                card.appendChild(silBtn);

                container.appendChild(card);
            });
        }).catch(() => {});
    } else {
        fetchWithRetry('https://api.frankfurter.dev/v1/latest?base=TRY')
            .then(data => {
                container.textContent = '';
                favoriler.forEach(kod => {
                    if (!data.rates[kod]) return;
                    const card = document.createElement('div');
                    card.className = 'favori-card';

                    const label = document.createElement('span');
                    label.className = 'favori-card-label';
                    label.textContent = kod + '/TRY';
                    card.appendChild(label);

                    const val = document.createElement('span');
                    val.className = 'favori-card-value';
                    val.textContent = (1 / data.rates[kod]).toFixed(4);
                    card.appendChild(val);

                    const silBtn = document.createElement('button');
                    silBtn.className = 'favori-sil-btn';
                    silBtn.innerHTML = '<i class="fas fa-times"></i>';
                    silBtn.title = t('favorilerdenCikar');
                    silBtn.onclick = () => toggleFavori(kod);
                    card.appendChild(silBtn);

                    container.appendChild(card);
                });
            }).catch(() => {});
    }
}

// =============================================
// UI
// =============================================

function arsivKontrolleriniGuncelle(kaynak) {
    document.getElementById('histEcbKontroller').classList.toggle('hidden', kaynak === 'tcmb');
    document.getElementById('histTcmbKontroller').classList.toggle('hidden', kaynak === 'ecb');

    const uyari = document.getElementById('histTcmbUyari');
    if (kaynak === 'tcmb') {
        uyari.textContent = t('tcmbSadeceTry');
        uyari.classList.remove('hidden');
    } else {
        uyari.classList.add('hidden');
    }

    // Tablo basligini sifirla
    const thead = document.querySelector('#historyTable thead tr');
    thead.textContent = '';
    if (kaynak === 'tcmb') {
        [t('thTarih'), t('thAlis'), t('thSatis')].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            thead.appendChild(th);
        });
    } else {
        [t('thTarih'), t('thKurDegeri')].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            thead.appendChild(th);
        });
    }

    // Tablo icerigini sifirla
    const tbody = document.getElementById('historyBody');
    tbody.textContent = '';
    const msgRow = document.createElement('tr');
    const msgCell = document.createElement('td');
    msgCell.colSpan = kaynak === 'tcmb' ? 3 : 2;
    msgCell.style.textAlign = 'center';
    msgCell.textContent = t('tarihAraligi');
    msgRow.appendChild(msgCell);
    tbody.appendChild(msgRow);

    // Eski CSV verisini temizle
    sonGecmisVeri = null;
}

function istatistikKontrolleriniGuncelle(kaynak) {
    const baseContainer = document.getElementById('statBaseContainer');
    const targetSelect = document.getElementById('statTarget');
    const uyari = document.getElementById('statTcmbUyari');
    const disclaimer = document.getElementById('statDisclaimer');

    if (kaynak === 'tcmb') {
        // TCMB: base'i gizle (sadece TRY bazli), target'i tcmb para birimleri ile doldur
        baseContainer.classList.add('hidden');

        const onceki = targetSelect.value;
        targetSelect.textContent = '';
        Object.entries(tcmbParaBirimleri).forEach(([code, info]) => {
            const option = document.createElement('option');
            option.value = code;
            const name = (currentLang === 'en') ? (info.nameEn || info.nameTr) : info.nameTr;
            option.text = `${code} - ${name}`;
            targetSelect.appendChild(option);
        });
        const mevcutMu = [...targetSelect.options].some(o => o.value === onceki);
        targetSelect.value = mevcutMu ? onceki : 'USD';

        uyari.textContent = t('tcmbSadeceTry');
        uyari.classList.remove('hidden');
        disclaimer.textContent = t('disclaimerTcmb');
    } else {
        // ECB: base'i goster, target'i ecb para birimleri ile doldur
        baseContainer.classList.remove('hidden');

        const oncekiBase = document.getElementById('statBase').value;
        const oncekiTarget = targetSelect.value;

        ['statBase', 'statTarget'].forEach(id => {
            const el = document.getElementById(id);
            el.textContent = '';
            Object.entries(tumParaBirimleri).forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.text = `${code} - ${name}`;
                el.appendChild(option);
            });
        });

        const baseEl = document.getElementById('statBase');
        baseEl.value = [...baseEl.options].some(o => o.value === oncekiBase) ? oncekiBase : 'USD';
        targetSelect.value = [...targetSelect.options].some(o => o.value === oncekiTarget) ? oncekiTarget : 'TRY';

        uyari.classList.add('hidden');
        disclaimer.textContent = t('disclaimerEcb');
    }

    // Istatistik sonuclarini temizle
    document.getElementById('statSonuclar').textContent = '';
}

function ceviriciDropdownGuncelle(kaynak) {
    const fromSelect = document.getElementById('calcFrom');
    const toSelect = document.getElementById('calcTo');
    const disclaimer = document.getElementById('calcDisclaimer');

    const oncekiFrom = fromSelect.value;
    const oncekiTo = toSelect.value;

    fromSelect.textContent = '';
    toSelect.textContent = '';

    if (kaynak === 'tcmb') {
        // TRY secenegi ekle
        [fromSelect, toSelect].forEach(sel => {
            const tryOpt = document.createElement('option');
            tryOpt.value = 'TRY';
            tryOpt.text = 'TRY - ' + (currentLang === 'en' ? 'Turkish Lira' : 'Türk Lirası');
            sel.appendChild(tryOpt);
        });

        // TCMB para birimlerini ekle
        Object.entries(tcmbParaBirimleri).forEach(([code, info]) => {
            [fromSelect, toSelect].forEach(sel => {
                const option = document.createElement('option');
                option.value = code;
                const name = (currentLang === 'en') ? (info.nameEn || info.nameTr) : info.nameTr;
                option.text = `${code} - ${name}`;
                sel.appendChild(option);
            });
        });

        disclaimer.textContent = t('disclaimerTcmb');
    } else {
        // ECB para birimlerini ekle
        Object.entries(tumParaBirimleri).forEach(([code, name]) => {
            [fromSelect, toSelect].forEach(sel => {
                const option = document.createElement('option');
                option.value = code;
                option.text = `${code} - ${name}`;
                sel.appendChild(option);
            });
        });

        disclaimer.textContent = t('disclaimerEcb');
    }

    // Onceki secimleri koru, yoksa varsayilan
    const fromMevcut = [...fromSelect.options].some(o => o.value === oncekiFrom);
    const toMevcut = [...toSelect.options].some(o => o.value === oncekiTo);
    fromSelect.value = fromMevcut ? oncekiFrom : 'USD';
    toSelect.value = toMevcut ? oncekiTo : 'TRY';

    // Hesaplama sonucunu sifirla
    document.getElementById('calcResult').textContent = t('hesaplamakIcin');
}

function gecmisKurlariGetirRouter() {
    if (currentKaynak === 'tcmb') {
        tcmbGecmisKurlariGetir();
    } else {
        gecmisKurlariGetir();
    }
}

function kurListesiFiltrele(aranan) {
    const rows = document.querySelectorAll('#kurListesiBody tr');
    const q = aranan.toLowerCase().trim();

    rows.forEach(row => {
        if (!q) {
            row.classList.remove('hidden');
            return;
        }
        const text = row.textContent.toLowerCase();
        row.classList.toggle('hidden', !text.includes(q));
    });
}

function tabDegistir(id, btn) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

// =============================================
// Init
// =============================================

window.onload = async function () {
    // Dil tercihini uygula
    document.getElementById('btnTr').classList.toggle('active', currentLang === 'tr');
    document.getElementById('btnEn').classList.toggle('active', currentLang === 'en');
    translatePage();

    await paraBirimleriniGetir();
    await tcmbParaBirimleriniDoldur();

    // Kaynak tercihini uygula
    setKaynak(currentKaynak);

    // Enter tusu ile hesaplama
    document.getElementById('calcAmount').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') ozelHesapla();
    });

    // Kur listesi arama
    document.getElementById('kurArama').addEventListener('input', function () {
        kurListesiFiltrele(this.value);
    });

    // Kayitli hesaplama gecmisini yukle
    renderHistory();
};
