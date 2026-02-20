/* ============================================
   Pratikur - TCMB Veri Islemleri
   ============================================ */

const TCMB_PROXY = '/.netlify/functions/tcmb-proxy';

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
        const select = document.getElementById('histTcmbTarget');
        select.textContent = '';
        Object.entries(data.rates).forEach(([code, info]) => {
            const option = document.createElement('option');
            option.value = code;
            option.text = `${code} - ${info.nameTr}`;
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
            document.getElementById('guncelKurKaynak').textContent =
                'T.C. Merkez Bankasi - ' + (data.date || 'Guncel');
        })
        .catch(() => {
            document.getElementById('guncelUsd').textContent = '--';
            document.getElementById('guncelEur').textContent = '--';
        });
}

async function tcmbGecmisKurlariGetir() {
    const start = document.getElementById('histStartDate').value;
    const end = document.getElementById('histEndDate').value;
    const target = document.getElementById('histTcmbTarget').value;
    const tbody = document.getElementById('historyBody');
    const progress = document.getElementById('histProgress');

    if (!start || !end) { alert('L\u00fctfen tarih araligi secin.'); return; }
    if (start > end) { alert('Baslangic tarihi bitis tarihinden buyuk olamaz.'); return; }

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
    progress.textContent = '0/' + dates.length + ' g\u00fcn y\u00fckleniyor...';

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
            progress.textContent = loaded + '/' + dates.length + ' g\u00fcn y\u00fckleniyor...';
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
        emptyCell.textContent = 'Bu tarih araligi icin TCMB verisi bulunamadi.';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        return;
    }

    // Tarihe gore sirala (yeniden eskiye)
    results.sort((a, b) => b.date.localeCompare(a.date));

    // Tablo basligini guncelle
    const thead = document.querySelector('#historyTable thead tr');
    thead.textContent = '';
    ['Tarih', 'Al\u0131\u015f', 'Sat\u0131\u015f'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        thead.appendChild(th);
    });

    results.forEach(item => {
        const tr = document.createElement('tr');
        const tdDate = document.createElement('td');
        tdDate.textContent = new Date(item.date).toLocaleDateString('tr-TR');
        const tdBuy = document.createElement('td');
        tdBuy.textContent = item.buying.toFixed(4);
        const tdSell = document.createElement('td');
        tdSell.textContent = item.selling.toFixed(4);
        tr.appendChild(tdDate);
        tr.appendChild(tdBuy);
        tr.appendChild(tdSell);
        tbody.appendChild(tr);
    });

    // CSV icin veri sakla
    sonGecmisVeri = { tcmb: true, target, results };
}

function tcmbTablosuGuncelle() {
    const tbody = document.getElementById('kurListesiBody');
    const baslik = document.getElementById('tabloBaslikDeger');
    const zamanBox = document.getElementById('zamanGosterge');

    baslik.innerText = currentDirection === 'duz'
        ? '1 TRY Karsiligi'
        : '1 Birimin TRY Karsiligi';

    tbody.textContent = '';
    const loadingRow = document.createElement('tr');
    const loadingCell = document.createElement('td');
    loadingCell.colSpan = 3;
    loadingCell.align = 'center';
    loadingCell.textContent = '\u23f3 G\u00fcncelleniyor...';
    loadingRow.appendChild(loadingCell);
    tbody.appendChild(loadingRow);

    tcmbKurlariGetir()
        .then(data => {
            tbody.textContent = '';

            if (data.date) {
                const tarih = new Date(data.date).toLocaleDateString('tr-TR');
                zamanBox.textContent = '';
                const icon = document.createElement('i');
                icon.className = 'fas fa-info-circle';
                zamanBox.appendChild(icon);
                zamanBox.appendChild(document.createTextNode(' T.C. Merkez Bankas\u0131 Kuru '));
                const bold = document.createElement('b');
                bold.textContent = '(Al\u0131\u015f/Sat\u0131\u015f)';
                zamanBox.appendChild(bold);
                zamanBox.appendChild(document.createTextNode(` - ${tarih}`));
            }

            Object.entries(data.rates).forEach(([kod, info]) => {
                const tr = document.createElement('tr');

                const tdName = document.createElement('td');
                const kodBold = document.createElement('b');
                kodBold.textContent = kod;
                tdName.appendChild(kodBold);
                tdName.appendChild(document.createTextNode(' '));
                const kodSpan = document.createElement('span');
                kodSpan.className = 'currency-name-detail';
                kodSpan.textContent = info.nameTr || '';
                tdName.appendChild(kodSpan);

                const tdBuying = document.createElement('td');
                const tdSelling = document.createElement('td');

                if (currentDirection === 'duz') {
                    tdBuying.textContent = formatla(1 / info.buying);
                    tdSelling.textContent = formatla(1 / info.selling);
                } else {
                    tdBuying.textContent = formatla(info.buying);
                    tdSelling.textContent = formatla(info.selling);
                }

                tr.appendChild(tdName);
                tr.appendChild(tdBuying);
                tr.appendChild(tdSelling);
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('TCMB kur listesi alinamadi:', err);
            tbody.textContent = '';
            const errRow = document.createElement('tr');
            const errCell = document.createElement('td');
            errCell.colSpan = 3;
            errCell.align = 'center';
            errCell.className = 'error-text';
            errCell.textContent = 'TCMB verileri y\u00fcklenemedi.';
            errRow.appendChild(errCell);
            tbody.appendChild(errRow);
        });
}
