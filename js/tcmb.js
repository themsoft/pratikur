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
