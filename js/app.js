/* Pratikur - Doviz Kuru */

let tumParaBirimleri = {};
let sonGelenVeri = null;
let currentDirection = 'duz';

async function paraBirimleriniGetir() {
    const response = await fetch('https://api.frankfurter.dev/v1/currencies');
    tumParaBirimleri = await response.json();

    const selectIds = ['baseCurrencySelect', 'calcFrom', 'calcTo'];
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
    await paraBirimleriniGetir();
    tabloyuGuncelle();
};
