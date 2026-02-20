/* ============================================
   Pratikur - Döviz Kuru Takip Uygulaması
   ============================================ */

// --- State ---
let tumParaBirimleri = {};
let sonGelenVeri = null;
let sonGecmisVeri = null;
let currentDirection = 'duz';
let deferredPrompt;

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

function guncelKurlariGoster() {
    fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=TRY')
        .then(res => res.json())
        .then(data => {
            document.getElementById('guncelUsd').textContent = data.rates.TRY.toFixed(4);
        })
        .catch(() => {
            document.getElementById('guncelUsd').textContent = '--';
        });

    fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY')
        .then(res => res.json())
        .then(data => {
            document.getElementById('guncelEur').textContent = data.rates.TRY.toFixed(4);
        })
        .catch(() => {
            document.getElementById('guncelEur').textContent = '--';
        });
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
        console.error('Para birimleri alinamadi:', e);
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
            errCell.textContent = 'Veriler y\u00fcklenemedi.';
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
            resBox.textContent = 'Hesaplama yapilamadi.';
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

    let csv = 'data:text/csv;charset=utf-8,\uFEFFPara Birimi;De\u011fer\n';
    Object.entries(sonGelenVeri.rates).forEach(([k, v]) => {
        const val = currentDirection === 'duz' ? v : (1 / v);
        csv += `${k};${String(val.toFixed(4)).replace('.', ',')}\n`;
    });

    csvIndir(`kur_listesi_${currentDirection}.csv`, csv);
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

    csvIndir(`kur_arsivi_${base}_${target}.csv`, csv);
}

// =============================================
// UI
// =============================================

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
    guncelKurlariGoster();
    await paraBirimleriniGetir();
    tabloyuGuncelle();

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
