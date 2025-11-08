/* Pratikur - Doviz Kuru */

let tumParaBirimleri = {};

async function paraBirimleriniGetir() {
    const response = await fetch('https://api.frankfurter.dev/v1/currencies');
    tumParaBirimleri = await response.json();

    const el = document.getElementById('baseCurrencySelect');
    el.innerHTML = '';
    Object.entries(tumParaBirimleri).forEach(([code, name]) => {
        el.innerHTML += `<option value="${code}">${code} - ${name}</option>`;
    });
    el.value = 'TRY';
}

function tabloyuGuncelle() {
    const base = document.getElementById('baseCurrencySelect').value;
    const tbody = document.getElementById('kurListesiBody');
    tbody.innerHTML = '<tr><td colspan="2" align="center">Guncelleniyor...</td></tr>';

    fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            Object.entries(data.rates).forEach(([kod, oran]) => {
                tbody.innerHTML += `<tr><td><b>${kod}</b> <span style="font-size:0.8em;color:#888">${tumParaBirimleri[kod] || ''}</span></td><td>1 ${base} = <b>${oran.toFixed(2)}</b> ${kod}</td></tr>`;
            });
        });
}

window.onload = async function () {
    await paraBirimleriniGetir();
    tabloyuGuncelle();
};
