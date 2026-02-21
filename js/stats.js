/* ============================================
   Pratikur - Kur Istatistikleri
   ============================================ */

// --- Hesaplama Fonksiyonlari ---

function calculateMonthlyAverages(rates) {
    const monthly = {};
    Object.entries(rates).forEach(function(entry) {
        var date = entry[0];
        var value = entry[1];
        var month = date.substring(0, 7); // YYYY-MM
        if (!monthly[month]) monthly[month] = [];
        monthly[month].push(value);
    });

    var result = [];
    Object.keys(monthly).sort().forEach(function(month) {
        var values = monthly[month];
        var sum = values.reduce(function(a, b) { return a + b; }, 0);
        result.push({
            month: month,
            average: sum / values.length,
            count: values.length
        });
    });
    return result;
}

function calculateMinMax(rates) {
    var min = { value: Infinity, date: '' };
    var max = { value: -Infinity, date: '' };

    Object.entries(rates).forEach(function(entry) {
        var date = entry[0];
        var value = entry[1];
        if (value < min.value) { min.value = value; min.date = date; }
        if (value > max.value) { max.value = value; max.date = date; }
    });

    return { min: min, max: max };
}

function calculatePercentageChange(sortedDates, rates) {
    if (sortedDates.length < 2) return null;

    var lastDate = sortedDates[sortedDates.length - 1];
    var firstDate = sortedDates[0];
    var lastValue = rates[lastDate];
    var firstValue = rates[firstDate];

    var totalChange = ((lastValue - firstValue) / firstValue) * 100;

    // Donemi 3 esit bolume ayir
    var segments = null;
    var n = sortedDates.length;
    if (n >= 6) {
        var idx1 = Math.floor(n / 3);
        var idx2 = Math.floor(2 * n / 3);

        segments = [
            {
                startDate: sortedDates[0],
                endDate: sortedDates[idx1],
                startValue: rates[sortedDates[0]],
                endValue: rates[sortedDates[idx1]],
                change: ((rates[sortedDates[idx1]] - rates[sortedDates[0]]) / rates[sortedDates[0]]) * 100
            },
            {
                startDate: sortedDates[idx1],
                endDate: sortedDates[idx2],
                startValue: rates[sortedDates[idx1]],
                endValue: rates[sortedDates[idx2]],
                change: ((rates[sortedDates[idx2]] - rates[sortedDates[idx1]]) / rates[sortedDates[idx1]]) * 100
            },
            {
                startDate: sortedDates[idx2],
                endDate: sortedDates[n - 1],
                startValue: rates[sortedDates[idx2]],
                endValue: rates[sortedDates[n - 1]],
                change: ((rates[sortedDates[n - 1]] - rates[sortedDates[idx2]]) / rates[sortedDates[idx2]]) * 100
            }
        ];
    }

    return {
        total: totalChange,
        segments: segments,
        firstValue: firstValue,
        lastValue: lastValue,
        firstDate: firstDate,
        lastDate: lastDate
    };
}

// --- Gosterim Fonksiyonlari ---

function formatChange(value) {
    if (value === null || value === undefined) return { text: '--', cls: 'trend-stable' };
    var sign = value >= 0 ? '+' : '';
    var cls = value > 0.01 ? 'trend-up' : (value < -0.01 ? 'trend-down' : 'trend-stable');
    return { text: sign + value.toFixed(2) + '%', cls: cls };
}

function formatTrendIcon(value) {
    if (value === null || value === undefined) return '\u2014';
    if (value > 0.01) return '\u25b2';
    if (value < -0.01) return '\u25bc';
    return '\u2014';
}

function renderStats(rates, base, target) {
    var container = document.getElementById('statSonuclar');
    container.textContent = '';

    var dateKeys = Object.keys(rates);
    if (dateKeys.length === 0) {
        container.textContent = t('statVeriBulunamadi');
        return;
    }

    // Flat rates objesi: { date: value }
    var flatRates = {};
    dateKeys.forEach(function(date) {
        flatRates[date] = rates[date][target];
    });

    var sortedDates = dateKeys.sort();

    // 1. Genel Bakis
    var minMax = calculateMinMax(flatRates);
    var changes = calculatePercentageChange(sortedDates, flatRates);

    if (changes) {
        var overviewCard = document.createElement('div');
        overviewCard.className = 'stat-card';

        var overviewTitle = document.createElement('div');
        overviewTitle.className = 'stat-card-title';
        overviewTitle.textContent = '1 ' + base + ' \u2192 ' + target;
        overviewCard.appendChild(overviewTitle);

        var overviewGrid = document.createElement('div');
        overviewGrid.className = 'stat-overview';

        var items = [
            { label: t('donemBaslangic'), value: changes.firstValue.toFixed(4), extra: formatDateLocale(changes.firstDate) },
            { label: t('donemSon'), value: changes.lastValue.toFixed(4), extra: formatDateLocale(changes.lastDate) },
            { label: t('ortalama'), value: calculateAverage(flatRates).toFixed(4) },
            { label: t('toplamDegisim'), value: formatChange(changes.total).text, cls: formatChange(changes.total).cls }
        ];

        items.forEach(function(item) {
            var el = document.createElement('div');
            el.className = 'stat-overview-item';

            var lbl = document.createElement('span');
            lbl.className = 'stat-overview-label';
            lbl.textContent = item.label;
            el.appendChild(lbl);

            var val = document.createElement('span');
            val.className = 'stat-overview-value';
            if (item.cls) val.className += ' ' + item.cls;
            val.textContent = item.value;
            el.appendChild(val);

            if (item.extra) {
                var ext = document.createElement('span');
                ext.className = 'stat-date';
                ext.textContent = item.extra;
                el.appendChild(ext);
            }

            overviewGrid.appendChild(el);
        });

        overviewCard.appendChild(overviewGrid);
        container.appendChild(overviewCard);
    }

    // 2. Min / Max
    var minMaxCard = document.createElement('div');
    minMaxCard.className = 'stat-card';

    var minMaxTitle = document.createElement('div');
    minMaxTitle.className = 'stat-card-title';
    minMaxTitle.textContent = t('enDusuk') + ' / ' + t('enYuksek');
    minMaxCard.appendChild(minMaxTitle);

    var highlight = document.createElement('div');
    highlight.className = 'stat-highlight';

    // En dusuk
    var lowItem = document.createElement('div');
    lowItem.className = 'stat-highlight-item low';
    var lowLabel = document.createElement('span');
    lowLabel.className = 'stat-highlight-label';
    lowLabel.textContent = t('enDusuk') + ' ' + formatTrendIcon(-1);
    lowItem.appendChild(lowLabel);
    var lowVal = document.createElement('span');
    lowVal.className = 'stat-highlight-value';
    lowVal.textContent = minMax.min.value.toFixed(4);
    lowItem.appendChild(lowVal);
    var lowDate = document.createElement('span');
    lowDate.className = 'stat-highlight-date';
    lowDate.textContent = formatDateLocale(minMax.min.date);
    lowItem.appendChild(lowDate);
    highlight.appendChild(lowItem);

    // En yuksek
    var highItem = document.createElement('div');
    highItem.className = 'stat-highlight-item high';
    var highLabel = document.createElement('span');
    highLabel.className = 'stat-highlight-label';
    highLabel.textContent = t('enYuksek') + ' ' + formatTrendIcon(1);
    highItem.appendChild(highLabel);
    var highVal = document.createElement('span');
    highVal.className = 'stat-highlight-value';
    highVal.textContent = minMax.max.value.toFixed(4);
    highItem.appendChild(highVal);
    var highDate = document.createElement('span');
    highDate.className = 'stat-highlight-date';
    highDate.textContent = formatDateLocale(minMax.max.date);
    highItem.appendChild(highDate);
    highlight.appendChild(highItem);

    minMaxCard.appendChild(highlight);
    container.appendChild(minMaxCard);

    // 3. Donem Analizi
    if (changes && changes.segments) {
        var changeCard = document.createElement('div');
        changeCard.className = 'stat-card';

        var changeTitle = document.createElement('div');
        changeTitle.className = 'stat-card-title';
        changeTitle.textContent = t('donemAnalizi');
        changeCard.appendChild(changeTitle);

        var changeGrid = document.createElement('div');
        changeGrid.className = 'stat-change-grid';

        changes.segments.forEach(function(seg) {
            var el = document.createElement('div');
            el.className = 'stat-change-item';

            var lbl = document.createElement('span');
            lbl.className = 'stat-change-label';
            lbl.textContent = formatDateLocale(seg.startDate) + ' \u2192 ' + formatDateLocale(seg.endDate);
            el.appendChild(lbl);

            var fc = formatChange(seg.change);
            var val = document.createElement('span');
            val.className = 'stat-change-value ' + fc.cls;
            val.textContent = formatTrendIcon(seg.change) + ' ' + fc.text;
            el.appendChild(val);

            changeGrid.appendChild(el);
        });

        changeCard.appendChild(changeGrid);
        container.appendChild(changeCard);
    }

    // 4. Aylik Ortalama Tablosu
    var monthlyAvg = calculateMonthlyAverages(flatRates);
    if (monthlyAvg.length > 1) {
        var avgCard = document.createElement('div');
        avgCard.className = 'stat-card';

        var avgTitle = document.createElement('div');
        avgTitle.className = 'stat-card-title';
        avgTitle.textContent = t('aylikOrtalama');
        avgCard.appendChild(avgTitle);

        monthlyAvg.forEach(function(item, idx) {
            var row = document.createElement('div');
            row.className = 'stat-row';

            var lbl = document.createElement('span');
            lbl.className = 'stat-label';
            lbl.textContent = formatMonthLabel(item.month);
            row.appendChild(lbl);

            var valWrap = document.createElement('span');

            var val = document.createElement('span');
            val.className = 'stat-value';
            val.textContent = item.average.toFixed(4);
            valWrap.appendChild(val);

            // Onceki aya gore degisim
            if (idx > 0) {
                var prev = monthlyAvg[idx - 1].average;
                var chg = ((item.average - prev) / prev) * 100;
                var fc = formatChange(chg);
                var badge = document.createElement('span');
                badge.className = fc.cls;
                badge.style.fontSize = '0.8em';
                badge.style.marginLeft = '6px';
                badge.textContent = formatTrendIcon(chg) + ' ' + fc.text;
                valWrap.appendChild(badge);
            }

            row.appendChild(valWrap);
            avgCard.appendChild(row);
        });

        container.appendChild(avgCard);
    }
}

// --- Yardimci ---

function calculateAverage(flatRates) {
    var values = Object.values(flatRates);
    if (values.length === 0) return 0;
    var sum = values.reduce(function(a, b) { return a + b; }, 0);
    return sum / values.length;
}

function formatDateLocale(dateStr) {
    return formatTarih(dateStr);
}

function formatMonthLabel(monthStr) {
    // monthStr: "2026-01" -> "Ocak 2026" / "January 2026"
    var parts = monthStr.split('-');
    var date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    var locale = currentLang === 'tr' ? 'tr-TR' : 'en-US';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
}

// --- Ana Fonksiyon ---

async function istatistikHesapla() {
    if (currentKaynak === 'tcmb') {
        tcmbIstatistikHesapla();
        return;
    }

    var start = document.getElementById('statStartDate').value;
    var end = document.getElementById('statEndDate').value;
    var base = document.getElementById('statBase').value;
    var target = document.getElementById('statTarget').value;
    var container = document.getElementById('statSonuclar');
    var progress = document.getElementById('statProgress');

    if (!start || !end) { alert(t('tarihSecin')); return; }
    if (start > end) { alert(t('tarihHata')); return; }
    if (base === target) { alert(t('paraBirimiFarkli')); return; }

    container.textContent = '';
    progress.classList.remove('hidden');
    progress.textContent = t('statHesaplaniyor');

    try {
        var data = await fetchWithRetry(
            'https://api.frankfurter.dev/v1/' + start + '..' + end + '?from=' + base + '&to=' + target
        );

        progress.classList.add('hidden');

        if (!data.rates || Object.keys(data.rates).length === 0) {
            container.textContent = t('statVeriBulunamadi');
            return;
        }

        renderStats(data.rates, base, target);
    } catch (err) {
        progress.classList.add('hidden');
        container.textContent = '';
        var errMsg = document.createElement('div');
        errMsg.className = 'error-text';
        errMsg.style.textAlign = 'center';
        errMsg.style.padding = '15px';
        errMsg.textContent = t('verilerYuklenemedi');
        container.appendChild(errMsg);
    }
}
