/* ============================================
   Pratikur - Yardimci Fonksiyonlar
   ============================================ */

// --- Sayi Formatlama ---

function formatla(n) {
    if (n < 0.01) return n.toFixed(6);
    if (n < 1) return n.toFixed(4);
    return n.toFixed(2);
}

// --- Fetch with Retry ---

async function fetchWithRetry(url, maxRetry = 3) {
    let lastError;
    for (let i = 0; i < maxRetry; i++) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            lastError = err;
            if (i < maxRetry - 1) {
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}

// --- Tarih Formatlama ---

function formatTarih(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const locale = (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'en-GB' : 'tr-TR';
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// --- CSV Indirme ---

function csvIndir(filename, csvContent) {
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = filename;
    link.click();
}
