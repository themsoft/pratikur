/* Pratikur - Doviz Kuru */

let tumParaBirimleri = {};
let sonGelenVeri = null;
let sonGecmisVeri = null;
let currentDirection = 'duz';
let binanceSocket = null;
let usdTry = 0;
let eurUsd = 0;

async function paraBirimleriniGetir() {
    const response = await fetch('https://api.frankfurter.dev/v1/currencies');
    tumParaBirimleri = await response.json();

    const selectIds = ['baseCurrencySelect', 'calcFrom', 'calcTo', 'histBase', 'histTarget'];
    selectIds.forEach(id => {
        const el = document.getElementById(id);
        el.innerHTML = '';
        Object.entries(tumParaBirimleri).forEach(([code, name]) => {
            el.innerHTML += `<option value="${code}">${code} - ${name}</option>`;
        });
    });

    document.getElementById('baseCurrencySelect').value = 'TRY';
    document.getElementById('calcFrom').value = 'USD';
    document.getElementById('calcTo').value = 'TRY';
    document.getElementById('histBase').value = 'USD';
    document.getElementById('histTarget').value = 'TRY';
}

function setDirection(dir) {
    currentDirection = dir;
    document.getElementById('btnDuz').classList.toggle('active', dir === 'duz');
    document.getElementById('btnTers').classList.toggle('active', dir === 'ters');
    tabloyuGuncelle();
}

function formatla(n) {
    if (n < 0.01) return n.toFixed(6);
    if (n < 1) return n.toFixed(4);
    return n.toFixed(2);
}

function tabloyuGuncelle() {
    const base = document.getElementById('baseCurrencySelect').value;
    const tbody = document.getElementById('kurListesiBody');
    const baslik = document.getElementById('tabloBaslikDeger');

    baslik.innerText = currentDirection === 'duz'
        ? `1 ${base} Karsiligi`
        : `1 Birimin ${base} Karsiligi`;

    tbody.innerHTML = '<tr><td colspan="2" align="center">Guncelleniyor...</td></tr>';

    fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`)
        .then(res => res.json())
        .then(data => {
            sonGelenVeri = data;
            tbody.innerHTML = '';
            Object.entries(data.rates).forEach(([kod, oran]) => {
                const deger = currentDirection === 'duz' ? oran : (1 / oran);
                if (currentDirection === 'duz') {
                    tbody.innerHTML += `<tr><td><b>${kod}</b> <span style="font-size:0.8em;color:#888">${tumParaBirimleri[kod] || ''}</span></td><td>1 ${base} = <b>${formatla(deger)}</b> ${kod}</td></tr>`;
                } else {
                    tbody.innerHTML += `<tr><td><b>${kod}</b> <span style="font-size:0.8em;color:#888">${tumParaBirimleri[kod] || ''}</span></td><td>1 ${kod} = <b>${formatla(deger)}</b> ${base}</td></tr>`;
                }
            });
        });
}

// =============================================
// WebSocket (Binance - Canli Piyasa)
// =============================================

function baslatWebSocket() {
    const streams = 'usdttry@miniTicker/eurusdt@miniTicker';
    const socketUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
        binanceSocket = new WebSocket(socketUrl);

        binanceSocket.onopen = function () {
            console.log('Canli baglanti saglandi.');
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
            console.error('WebSocket baglanti hatasi:', error);
        };

        binanceSocket.onclose = function () {
            setTimeout(baslatWebSocket, 5000);
        };
    } catch (e) {
        console.error('Socket baslatilamadi:', e);
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
function tabDegistir(id, btn) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

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
        resBox.innerHTML = 'Ayni para birimi secili.';
        return;
    }

    resBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hesaplaniyor...';

    fetch(`https://api.frankfurter.dev/v1/latest?amount=${amt}&from=${from}&to=${to}`)
        .then(r => r.json())
        .then(d => {
            const formatted = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: to
            }).format(d.rates[to]);
            resBox.innerHTML = `${amt} ${from} = <b>${formatted}</b>`;
            updateHistory(`${amt} ${from} -> ${d.rates[to].toFixed(2)} ${to}`);
        });
}

function updateHistory(text) {
    const ul = document.getElementById('historyList');
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const li = `<li class="history-item"><span>${text}</span><span class="history-time">${time}</span></li>`;
    ul.innerHTML = li + ul.innerHTML;
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

    if (!start || !end) { alert('Lutfen tarih araligi secin.'); return; }
    if (start > end) { alert('Baslangic tarihi bitis tarihinden buyuk olamaz.'); return; }
    if (base === target) { alert('Para birimleri farkli olmali.'); return; }

    tbody.innerHTML = '<tr><td colspan="2" align="center"><i class="fas fa-spinner fa-spin"></i> Yukleniyor...</td></tr>';

    fetch(`https://api.frankfurter.dev/v1/${start}..${end}?from=${base}&to=${target}`)
        .then(res => res.json())
        .then(data => {
            sonGecmisVeri = data;
            tbody.innerHTML = '';

            if (!data.rates || Object.keys(data.rates).length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" align="center">Bu tarih araligi icin veri bulunamadi.</td></tr>';
                return;
            }

            const dates = Object.keys(data.rates).sort().reverse();
            dates.forEach(date => {
                const rate = data.rates[date][target];
                const formattedDate = new Date(date).toLocaleDateString('tr-TR');
                tbody.innerHTML += `<tr><td>${formattedDate}</td><td>1 ${base} = <b>${rate.toFixed(4)}</b> ${target}</td></tr>`;
            });
        });
}

function gecmisExcelIndir() {
    if (!sonGecmisVeri || !sonGecmisVeri.rates) {
        alert('Once kur verilerini getirmelisiniz.');
        return;
    }

    const dates = Object.keys(sonGecmisVeri.rates).sort().reverse();
    if (dates.length === 0) {
        alert('Indirilecek veri yok.');
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

window.onload = async function () {
    baslatWebSocket();
    await paraBirimleriniGetir();
    tabloyuGuncelle();
};
