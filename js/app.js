/* ============================================
   Pratikur - Döviz Kuru Takip Uygulaması
   ============================================ */

// --- State ---
let tumParaBirimleri = {};
let sonGelenVeri = null;
let sonGecmisVeri = null;
let currentDirection = 'duz';
let deferredPrompt;
let binanceSocket = null;
let usdTry = 0;
let eurUsd = 0;

// =============================================
// PWA
// =============================================

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('SW kayıtlı'))
        .catch(err => console.log('SW hatası:', err));
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'block';
});

function uygulamayiYukle() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                document.getElementById('installBtn').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
}

// =============================================
// WebSocket (Binance - Canlı Piyasa)
// =============================================

function baslatWebSocket() {
    const streams = 'usdttry@miniTicker/eurusdt@miniTicker';
    const socketUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
        binanceSocket = new WebSocket(socketUrl);

        binanceSocket.onopen = function () {
            console.log('Canlı bağlantı sağlandı.');
        };

        binanceSocket.onmessage = function (event) {
            const mesaj = JSON.parse(event.data);
            const veri = mesaj.data;

            if (veri.s === 'USDTTRY') {
                usdTry = parseFloat(veri.c);
                updatePriceUI('liveUsd', usdTry);
                if (eurUsd > 0) updatePriceUI('liveEur', eurUsd * usdTry);
            } else if (veri.s === 'EURUSDT') {
                eurUsd = parseFloat(veri.c);
                if (usdTry > 0) updatePriceUI('liveEur', eurUsd * usdTry);
            }
        };

        binanceSocket.onerror = function (error) {
            console.error('WebSocket bağlantı hatası:', error);
        };

        binanceSocket.onclose = function () {
            setTimeout(baslatWebSocket, 5000);
        };
    } catch (e) {
        console.error('Socket başlatılamadı:', e);
    }
}

function updatePriceUI(id, price) {
    const el = document.getElementById(id);
    const oldPrice = parseFloat(el.innerText.replace('\u20ba', ''));

    el.innerText = price.toFixed(2) + ' \u20ba';

    if (!isNaN(oldPrice)) {
        if (price > oldPrice) {
            el.style.color = '#2ecc71';
        } else if (price < oldPrice) {
            el.style.color = '#e74c3c';
        } else {
            el.style.color = 'white';
        }
    }
}

// =============================================
// API (Frankfurter)
// =============================================

async function paraBirimleriniGetir() {
    try {
        const response = await fetch('https://api.frankfurter.dev/v1/currencies');
        tumParaBirimleri = await response.json();

        const selectIds = ['baseCurrencySelect', 'calcFrom', 'calcTo', 'histBase', 'histTarget'];
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

        // Varsayilan tarih araligi (son 7 gun)
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);
        document.getElementById('histEndDate').valueAsDate = today;
        document.getElementById('histStartDate').valueAsDate = lastWeek;
    } catch (e) {
        console.error(e);
    }
}

// =============================================
// Tab 1 - Kur Listesi
// =============================================

function setDirection(dir) {
    currentDirection = dir;
    document.getElementById('btnDuz').classList.toggle('active', dir === 'duz');
    document.getElementById('btnTers').classList.toggle('active', dir === 'ters');
    tabloyuGuncelle();
}

function tabloyuGuncelle() {
    const base = document.getElementById('baseCurrencySelect').value;
    const tbody = document.getElementById('kurListesiBody');
    const baslik = document.getElementById('tabloBaslikDeger');
    const zamanBox = document.getElementById('zamanGosterge');

    baslik.innerText = currentDirection === 'duz'
        ? `1 ${base} Karsiligi`
        : `1 Birimin ${base} Karsiligi`;

    tbody.textContent = '';
    const loadingRow = document.createElement('tr');
    const loadingCell = document.createElement('td');
    loadingCell.colSpan = 2;
    loadingCell.align = 'center';
    loadingCell.textContent = '\u23f3 G\u00fcncelleniyor...';
    loadingRow.appendChild(loadingCell);
    tbody.appendChild(loadingRow);

    fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`)
        .then(res => res.json())
        .then(data => {
            sonGelenVeri = data;
            tbody.textContent = '';

            const tarih = new Date(data.date).toLocaleDateString('tr-TR');
            zamanBox.textContent = '';
            const icon = document.createElement('i');
            icon.className = 'fas fa-info-circle';
            zamanBox.appendChild(icon);
            zamanBox.appendChild(document.createTextNode(' Avrupa Merkez Bankas\u0131 Kuru '));
            const bold = document.createElement('b');
            bold.textContent = '(G\u00fcnl\u00fck Kapan\u0131\u015f)';
            zamanBox.appendChild(bold);
            zamanBox.appendChild(document.createTextNode(` - ${tarih}`));

            Object.entries(data.rates).forEach(([kod, oran]) => {
                const deger = currentDirection === 'duz' ? oran : (1 / oran);
                const tr = document.createElement('tr');

                const tdName = document.createElement('td');
                const kodBold = document.createElement('b');
                kodBold.textContent = kod;
                tdName.appendChild(kodBold);
                tdName.appendChild(document.createTextNode(' '));
                const kodSpan = document.createElement('span');
                kodSpan.style.fontSize = '0.8em';
                kodSpan.style.color = '#888';
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
    const amt = document.getElementById('calcAmount').value;
    const from = document.getElementById('calcFrom').value;
    const to = document.getElementById('calcTo').value;
    const resBox = document.getElementById('calcResult');

    if (from === to) {
        resBox.textContent = 'Ayni para birimi secili.';
        return;
    }

    resBox.textContent = '';
    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    resBox.appendChild(spinner);
    resBox.appendChild(document.createTextNode(' Hesaplaniyor...'));

    fetch(`https://api.frankfurter.dev/v1/latest?amount=${amt}&from=${from}&to=${to}`)
        .then(r => r.json())
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
        });
}

function updateHistory(text) {
    const ul = document.getElementById('historyList');
    const li = document.createElement('li');
    li.className = 'history-item';
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const spanText = document.createElement('span');
    spanText.textContent = text;
    const spanTime = document.createElement('span');
    spanTime.className = 'history-time';
    spanTime.textContent = time;

    li.appendChild(spanText);
    li.appendChild(spanTime);

    if (ul.firstChild) {
        ul.insertBefore(li, ul.firstChild);
    } else {
        ul.appendChild(li);
    }

    // Maksimum 5 kayit tut
    if (ul.children.length > 5) {
        ul.removeChild(ul.lastChild);
    }
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

    if (!start || !end) { alert('L\u00fctfen tarih araligi secin.'); return; }
    if (start > end) { alert('Baslangic tarihi bitis tarihinden buyuk olamaz.'); return; }
    if (base === target) { alert('Para birimleri farkli olmali.'); return; }

    tbody.textContent = '';
    const loadRow = document.createElement('tr');
    const loadCell = document.createElement('td');
    loadCell.colSpan = 2;
    loadCell.align = 'center';
    const loadSpinner = document.createElement('i');
    loadSpinner.className = 'fas fa-spinner fa-spin';
    loadCell.appendChild(loadSpinner);
    loadCell.appendChild(document.createTextNode(' Y\u00fckleniyor...'));
    loadRow.appendChild(loadCell);
    tbody.appendChild(loadRow);

    fetch(`https://api.frankfurter.dev/v1/${start}..${end}?from=${base}&to=${target}`)
        .then(res => {
            if (!res.ok) throw new Error('Veri alinamadi');
            return res.json();
        })
        .then(data => {
            sonGecmisVeri = data;
            tbody.textContent = '';

            if (!data.rates || Object.keys(data.rates).length === 0) {
                const emptyRow = document.createElement('tr');
                const emptyCell = document.createElement('td');
                emptyCell.colSpan = 2;
                emptyCell.align = 'center';
                emptyCell.textContent = 'Bu tarih araligi icin veri bulunamadi.';
                emptyRow.appendChild(emptyCell);
                tbody.appendChild(emptyRow);
                return;
            }

            const dates = Object.keys(data.rates).sort().reverse();
            dates.forEach(date => {
                const rate = data.rates[date][target];
                const formattedDate = new Date(date).toLocaleDateString('tr-TR');

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
        });
}

// =============================================
// Export (CSV)
// =============================================

function excelIndir() {
    if (!sonGelenVeri) return;

    let csv = 'data:text/csv;charset=utf-8,\uFEFFPara Birimi;De\u011fer\n';
    Object.entries(sonGelenVeri.rates).forEach(([k, v]) => {
        const val = currentDirection === 'duz' ? v : (1 / v);
        csv += `${k};${String(val.toFixed(4)).replace('.', ',')}\n`;
    });

    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `kur_listesi_${currentDirection}.csv`;
    link.click();
}

function gecmisExcelIndir() {
    if (!sonGecmisVeri || !sonGecmisVeri.rates) {
        alert('\u00d6nce kur verilerini getirmelisiniz.');
        return;
    }

    const dates = Object.keys(sonGecmisVeri.rates).sort().reverse();
    if (dates.length === 0) {
        alert('\u0130ndirilecek veri yok.');
        return;
    }

    const base = sonGecmisVeri.base || document.getElementById('histBase').value;
    const target = Object.keys(sonGecmisVeri.rates[dates[0]])[0];

    let csv = `data:text/csv;charset=utf-8,\uFEFF Tarih;1 ${base} Karsiligi (${target})\n`;
    dates.forEach(date => {
        const rate = sonGecmisVeri.rates[date][target];
        if (rate !== undefined) {
            const formattedDate = new Date(date).toLocaleDateString('tr-TR');
            csv += `${formattedDate};${String(rate.toFixed(4)).replace('.', ',')}\n`;
        }
    });

    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `kur_arsivi_${base}_${target}.csv`;
    link.click();
}

// =============================================
// UI
// =============================================

function tabDegistir(id, btn) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

function formatla(n) {
    if (n < 0.01) return n.toFixed(6);
    if (n < 1) return n.toFixed(4);
    return n.toFixed(2);
}

// =============================================
// Init
// =============================================

window.onload = async function () {
    baslatWebSocket();
    await paraBirimleriniGetir();
    tabloyuGuncelle();
};
