/* ============================================
   Pratikur - TCMB Veri Islemleri
   ============================================ */

const TCMB_PROXY = '/.netlify/functions/tcmb-proxy';
let tcmbParaBirimleri = {};

async function tcmbKurlariGetir() {
    const data = await fetchWithRetry(TCMB_PROXY);
    return data;
}

async function tcmbGecmisKurGetir(dateStr) {
    // dateStr: YYYY-MM-DD formatinda gelir -> DDMMYYYY'ye cevir
    const parts = dateStr.split('-');
    const param = parts[2] + parts[1] + parts[0];
    const data = await fetchWithRetry(`${TCMB_PROXY}?date=${param}`);
    return data;
}

async function tcmbParaBirimleriniDoldur() {
    try {
        const data = await tcmbKurlariGetir();
        tcmbParaBirimleri = {};
        const select = document.getElementById('histTcmbTarget');
        select.textContent = '';
        Object.entries(data.rates).forEach(([code, info]) => {
            tcmbParaBirimleri[code] = {
                nameTr: info.nameTr || code,
                nameEn: info.nameEn || info.nameTr || code
            };
            const option = document.createElement('option');
            option.value = code;
            const name = (typeof currentLang !== 'undefined' && currentLang === 'en') ? (info.nameEn || info.nameTr) : info.nameTr;
            option.text = `${code} - ${name}`;
            select.appendChild(option);
        });
        select.value = 'USD';
    } catch (e) {
        console.error('TCMB para birimleri alinamadi:', e);
    }
}

function tcmbGuncelKurlariGoster() {
    tcmbKurlariGetir()
        .then(data => {
            if (data.rates.USD) {
                document.getElementById('guncelUsd').textContent = data.rates.USD.selling.toFixed(4);
            }
            if (data.rates.EUR) {
                document.getElementById('guncelEur').textContent = data.rates.EUR.selling.toFixed(4);
            }
            kaynakBilgisiniGuncelle('tcmb', data.date);
        })
        .catch(() => {
            document.getElementById('guncelUsd').textContent = '--';
            document.getElementById('guncelEur').textContent = '--';
            kaynakBilgisiniGuncelle('tcmb', null);
        });
}

async function tcmbGecmisKurlariGetir() {
    const start = document.getElementById('histStartDate').value;
    const end = document.getElementById('histEndDate').value;
    const target = document.getElementById('histTcmbTarget').value;
    const tbody = document.getElementById('historyBody');
    const progress = document.getElementById('histProgress');

    if (!start || !end) { alert(t('tarihSecin')); return; }
    if (start > end) { alert(t('tarihHata')); return; }

    // Tarih listesi olustur (is gunleri)
    const dates = [];
    const d = new Date(start);
    const endDate = new Date(end);
    while (d <= endDate) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) {
            dates.push(d.toISOString().split('T')[0]);
        }
        d.setDate(d.getDate() + 1);
    }

    tbody.textContent = '';
    progress.classList.remove('hidden');
    progress.textContent = '0/' + dates.length + t('gunYukleniyor');

    const results = [];
    let loaded = 0;

    // Paralel istek (max 5 concurrent)
    const chunks = [];
    for (let i = 0; i < dates.length; i += 5) {
        chunks.push(dates.slice(i, i + 5));
    }

    for (const chunk of chunks) {
        const promises = chunk.map(async (dateStr) => {
            try {
                const data = await tcmbGecmisKurGetir(dateStr);
                if (data.rates && data.rates[target]) {
                    results.push({
                        date: data.date || dateStr,
                        buying: data.rates[target].buying,
                        selling: data.rates[target].selling
                    });
                }
            } catch (e) {
                // Hafta sonu/tatil 404 -> atla
            }
            loaded++;
            progress.textContent = loaded + '/' + dates.length + t('gunYukleniyor');
        });
        await Promise.all(promises);
    }

    progress.classList.add('hidden');
    tbody.textContent = '';

    if (results.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 3;
        emptyCell.align = 'center';
        emptyCell.textContent = t('tcmbVeriBulunamadi');
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        return;
    }

    // Tarihe gore sirala (yeniden eskiye)
    results.sort((a, b) => b.date.localeCompare(a.date));

    // Tablo basligini guncelle (para birimi cifti ile)
    const locale = currentLang === 'en' ? 'en-US' : 'tr-TR';
    const thead = document.querySelector('#historyTable thead tr');
    thead.textContent = '';
    [t('thTarih'), `${target}/TRY ${t('thAlis')}`, `${target}/TRY ${t('thSatis')}`].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        thead.appendChild(th);
    });

    results.forEach(item => {
        const tr = document.createElement('tr');
        const tdDate = document.createElement('td');
        tdDate.textContent = new Date(item.date).toLocaleDateString(locale);

        const tdBuy = document.createElement('td');
        tdBuy.appendChild(document.createTextNode(`1 ${target} = `));
        const buyBold = document.createElement('b');
        buyBold.textContent = item.buying.toFixed(4);
        tdBuy.appendChild(buyBold);
        tdBuy.appendChild(document.createTextNode(' TRY'));

        const tdSell = document.createElement('td');
        tdSell.appendChild(document.createTextNode(`1 ${target} = `));
        const sellBold = document.createElement('b');
        sellBold.textContent = item.selling.toFixed(4);
        tdSell.appendChild(sellBold);
        tdSell.appendChild(document.createTextNode(' TRY'));

        tr.appendChild(tdDate);
        tr.appendChild(tdBuy);
        tr.appendChild(tdSell);
        tbody.appendChild(tr);
    });

    // CSV icin veri sakla
    sonGecmisVeri = { tcmb: true, target, results };
}

function tcmbTablosuGuncelle(base) {
    base = base || 'TRY';
    const tbody = document.getElementById('kurListesiBody');

    tbody.textContent = '';
    const loadingRow = document.createElement('tr');
    const loadingCell = document.createElement('td');
    loadingCell.colSpan = 3;
    loadingCell.style.textAlign = 'center';
    loadingCell.textContent = t('guncelleniyor');
    loadingRow.appendChild(loadingCell);
    tbody.appendChild(loadingRow);

    tcmbKurlariGetir()
        .then(data => {
            tbody.textContent = '';
            const isCross = (base !== 'TRY');
            const baseInfo = isCross ? data.rates[base] : null;

            // Capraz kurda base para birimi bulunamazsa TRY'ye don
            if (isCross && !baseInfo) {
                base = 'TRY';
            }

            Object.entries(data.rates).forEach(([kod, info]) => {
                // Base para birimini listeden cikar
                if (kod === base) return;

                const tr = document.createElement('tr');

                const tdName = document.createElement('td');
                const kodBold = document.createElement('b');
                kodBold.textContent = kod;
                tdName.appendChild(kodBold);
                tdName.appendChild(document.createTextNode(' '));
                const kodSpan = document.createElement('span');
                kodSpan.className = 'currency-name-detail';
                kodSpan.textContent = (currentLang === 'en' ? info.nameEn : info.nameTr) || '';
                tdName.appendChild(kodSpan);

                let buyVal, sellVal;
                if (base === 'TRY') {
                    // TRY bazli: mevcut davranis
                    if (currentDirection === 'duz') {
                        buyVal = 1 / info.buying;
                        sellVal = 1 / info.selling;
                    } else {
                        buyVal = info.buying;
                        sellVal = info.selling;
                    }
                } else {
                    // Capraz kur hesaplama
                    const crossBuy = info.buying / baseInfo.buying;
                    const crossSell = info.selling / baseInfo.selling;
                    if (currentDirection === 'duz') {
                        buyVal = crossBuy;
                        sellVal = crossSell;
                    } else {
                        buyVal = 1 / crossBuy;
                        sellVal = 1 / crossSell;
                    }
                }

                const tdBuying = document.createElement('td');
                tdBuying.textContent = formatla(buyVal);
                const tdSelling = document.createElement('td');
                tdSelling.textContent = formatla(sellVal);

                tr.appendChild(tdName);
                tr.appendChild(tdBuying);
                tr.appendChild(tdSelling);
                tbody.appendChild(tr);
            });

            // TRY satiri ekle (capraz kurda)
            if (isCross && baseInfo) {
                const tr = document.createElement('tr');
                const tdName = document.createElement('td');
                const kodBold = document.createElement('b');
                kodBold.textContent = 'TRY';
                tdName.appendChild(kodBold);
                tdName.appendChild(document.createTextNode(' '));
                const kodSpan = document.createElement('span');
                kodSpan.className = 'currency-name-detail';
                kodSpan.textContent = currentLang === 'en' ? 'Turkish Lira' : 'Türk Lirası';
                tdName.appendChild(kodSpan);

                let buyVal, sellVal;
                if (currentDirection === 'duz') {
                    buyVal = 1 / baseInfo.buying;
                    sellVal = 1 / baseInfo.selling;
                } else {
                    buyVal = baseInfo.buying;
                    sellVal = baseInfo.selling;
                }

                const tdBuying = document.createElement('td');
                tdBuying.textContent = formatla(buyVal);
                const tdSelling = document.createElement('td');
                tdSelling.textContent = formatla(sellVal);

                tr.appendChild(tdName);
                tr.appendChild(tdBuying);
                tr.appendChild(tdSelling);
                tbody.appendChild(tr);
            }
        })
        .catch(err => {
            console.error('TCMB kur listesi alinamadi:', err);
            tbody.textContent = '';
            const errRow = document.createElement('tr');
            const errCell = document.createElement('td');
            errCell.colSpan = 3;
            errCell.style.textAlign = 'center';
            errCell.className = 'error-text';
            errCell.textContent = t('tcmbVerilerYuklenemedi');
            errRow.appendChild(errCell);
            tbody.appendChild(errRow);
        });
}

// =============================================
// Istatistik - TCMB
// =============================================

async function tcmbIstatistikHesapla() {
    const target = document.getElementById('statTarget').value;
    const start = document.getElementById('statStartDate').value;
    const end = document.getElementById('statEndDate').value;
    const container = document.getElementById('statSonuclar');
    const progress = document.getElementById('statProgress');

    if (!start || !end) { alert(t('tarihSecin')); return; }
    if (start > end) { alert(t('tarihHata')); return; }

    // Tarih listesi olustur (is gunleri)
    const dates = [];
    const d = new Date(start);
    const endDate = new Date(end);
    while (d <= endDate) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) {
            dates.push(d.toISOString().split('T')[0]);
        }
        d.setDate(d.getDate() + 1);
    }

    container.textContent = '';
    progress.classList.remove('hidden');
    progress.textContent = '0/' + dates.length + t('gunYukleniyor');

    const ratesObj = {};
    let loaded = 0;

    // Paralel istek (max 5 concurrent)
    const chunks = [];
    for (let i = 0; i < dates.length; i += 5) {
        chunks.push(dates.slice(i, i + 5));
    }

    for (const chunk of chunks) {
        const promises = chunk.map(async (dateStr) => {
            try {
                const data = await tcmbGecmisKurGetir(dateStr);
                if (data.rates && data.rates[target]) {
                    // renderStats beklentisi: rates[date][target] = value
                    ratesObj[data.date || dateStr] = {};
                    ratesObj[data.date || dateStr]['TRY'] = data.rates[target].selling;
                }
            } catch (e) {
                // Hafta sonu/tatil 404 -> atla
            }
            loaded++;
            progress.textContent = loaded + '/' + dates.length + t('gunYukleniyor');
        });
        await Promise.all(promises);
    }

    progress.classList.add('hidden');

    if (Object.keys(ratesObj).length === 0) {
        container.textContent = t('statVeriBulunamadi');
        return;
    }

    // TCMB notu ekle
    const not = document.createElement('div');
    not.className = 'disclaimer-small';
    not.style.marginBottom = '10px';
    not.textContent = t('tcmbStatNot');
    container.appendChild(not);

    renderStats(ratesObj, target, 'TRY');
}

// =============================================
// Cevirici - TCMB Hesaplama
// =============================================

async function tcmbOzelHesapla() {
    const amt = parseFloat(document.getElementById('calcAmount').value);
    const from = document.getElementById('calcFrom').value;
    const to = document.getElementById('calcTo').value;
    const resBox = document.getElementById('calcResult');

    if (from === to) {
        resBox.textContent = t('ayniParaBirimi');
        return;
    }

    if (isNaN(amt) || amt <= 0) {
        resBox.textContent = t('gecerliMiktar');
        return;
    }

    resBox.textContent = '';
    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    resBox.appendChild(spinner);
    resBox.appendChild(document.createTextNode(' ' + t('hesaplaniyor')));

    try {
        const data = await tcmbKurlariGetir();
        let buyResult, sellResult;

        if (from === 'TRY' && to === 'TRY') {
            resBox.textContent = t('ayniParaBirimi');
            return;
        } else if (from === 'TRY') {
            // TRY -> yabanci: alis ile bol, satis ile bol
            buyResult = amt / data.rates[to].buying;
            sellResult = amt / data.rates[to].selling;
        } else if (to === 'TRY') {
            // Yabanci -> TRY: alis ile carp, satis ile carp
            buyResult = amt * data.rates[from].buying;
            sellResult = amt * data.rates[from].selling;
        } else {
            // Capraz kur: yabanci -> yabanci
            buyResult = amt * (data.rates[from].buying / data.rates[to].buying);
            sellResult = amt * (data.rates[from].selling / data.rates[to].selling);
        }

        const locale = currentLang === 'en' ? 'en-US' : 'tr-TR';
        resBox.textContent = '';

        // Alis satiri
        const buyRow = document.createElement('div');
        buyRow.className = 'calc-result-row';
        const buyLabel = document.createElement('span');
        buyLabel.className = 'calc-result-label';
        buyLabel.textContent = t('alisFiyati') + ':';
        const buyValue = document.createElement('span');
        buyValue.appendChild(document.createTextNode(`${amt} ${from} = `));
        const buyBold = document.createElement('b');
        buyBold.textContent = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(buyResult);
        buyValue.appendChild(buyBold);
        buyValue.appendChild(document.createTextNode(` ${to}`));
        buyRow.appendChild(buyLabel);
        buyRow.appendChild(buyValue);

        // Satis satiri
        const sellRow = document.createElement('div');
        sellRow.className = 'calc-result-row';
        const sellLabel = document.createElement('span');
        sellLabel.className = 'calc-result-label';
        sellLabel.textContent = t('satisFiyati') + ':';
        const sellValue = document.createElement('span');
        sellValue.appendChild(document.createTextNode(`${amt} ${from} = `));
        const sellBold = document.createElement('b');
        sellBold.textContent = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(sellResult);
        sellValue.appendChild(sellBold);
        sellValue.appendChild(document.createTextNode(` ${to}`));
        sellRow.appendChild(sellLabel);
        sellRow.appendChild(sellValue);

        resBox.appendChild(buyRow);
        resBox.appendChild(sellRow);

        updateHistory(`${amt} ${from} -> ${sellResult.toFixed(2)} ${to} (TCMB)`);
    } catch (err) {
        console.error('TCMB hesaplama hatasi:', err);
        resBox.textContent = t('hesaplamaYapilamadi');
    }
}
